'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  express = require('express'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  RedisStore = require('connect-redis')(session),
  favicon = require('serve-favicon'),
  cookieParser = require('cookie-parser'),
  helmet = require('helmet'),
  consolidate = require('consolidate'),
  path = require('path'),
  http = require('http'),
  https = require('https'),
  fs = require('fs'),
  winston = require('./winston'),

  //documentation
  docs = require("express-mongoose-docs");

 //language configuration parameters
    global.languages = {};
    const language_folder_path = './config/languages/';
    global.vod_list = {};
    global.livetv_s_subscription_end = [];
    global.livetv_l_subscription_end = [];
    global.vod_s_subscription_end = [];
    global.vod_l_subscription_end = [];

/**
 * Initialize local variables
 */
module.exports.initLocalVariables = function(app) {
  winston.info('Initializing LocalVariables...');
  // Setting application local variables
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  if (config.secure && config.secure.ssl === true) {
    app.locals.secure = config.secure.ssl;
  }
  app.locals.keywords = config.app.keywords;
  app.locals.googleAnalyticsTrackingID = config.app.googleAnalyticsTrackingID;

  app.locals.logo = config.logo;
  app.locals.favicon = config.favicon;
  app.locals.usersProfileDir = config.app.usersProfileDir;
  app.locals.reCaptchaSecret = config.app.reCaptchaSecret;
  app.locals.livereload = config.livereload;

  // Passing the request url to environment locals
  app.use(function(req, res, next) {
    res.locals.host = req.protocol + '://' + req.hostname;
    res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
    app.locals.originUrl = req.protocol + '://' + req.headers.host;
    next();
  });
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = function(app) {
  winston.info('Initializing Middleware...');

  // Showing stack errors
  app.set('showStackError', true);

  // Enable jsonp
  app.enable('jsonp callback');

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan)
    //app.use(morgan('dev'));

    // Disable views cache
    app.set('view cache', false);
  } else
  if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());

  // Add the cookie parser and flash middleware
  app.use(cookieParser());

  //docs api
  docs(app);

};

/**
 * Configure view engine
 */
module.exports.initViewEngine = function(app) {
  winston.info('Initializing ViewEngine...');
  // Set swig as the template engine
  app.engine('server.view.html', consolidate[config.templateEngine]);

  // Set views path and view engine
  app.set('view engine', 'server.view.html');
  app.set('views', './');
};

/**
 * Configure Express session
 */
module.exports.initSession = function(app, db) {
  winston.info('Initializing Session...');

  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    cookie: {
      maxAge: config.sessionCookie.maxAge,
      httpOnly: config.sessionCookie.httpOnly,
      secure: config.sessionCookie.secure && config.secure && config.secure.ssl
    },
    key: config.sessionKey,
    store: new RedisStore({
      host: config.redis.host || 'localhost',
      port: config.redis.port || 6379,
      db: config.redis.database || 0,
      pass: config.redis.password || ''
    })
  }));
};

/**
 * Invoke modules server configuration
 */
module.exports.initModulesConfiguration = function(app, db) {
  winston.info('Initializing Modules Configuration...');
  config.files.server.configs.forEach(function(configPath) {
    require(path.resolve(configPath))(app, db);
  });
};

/**
 * Configure Helmet headers configuration
 */
module.exports.initHelmetHeaders = function(app) {
  winston.info('Initializing Helmet Headers...');
  // Use helmet to secure Express headers
  var SIX_MONTHS = 15778476000;
  app.use(helmet.frameguard());
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.hsts({
    maxAge: SIX_MONTHS,
    includeSubdomains: true,
    force: true
  }));
  app.disable('x-powered-by');
};

/**
 * Configure the modules static routes
 */
module.exports.initModulesClientRoutes = function(app) {
  winston.info('Initializing Modules Client Routes...');
  // Setting the app router and static folder
  app.use('/', express.static(path.resolve('./public')));
};

/**
 * Configure the modules ACL policies
 */
module.exports.initModulesServerPolicies = function(app) {
  winston.info('Initializing Modules Server Policies...');

  // Globbing policy files
  config.files.server.policies.forEach(function(policyPath) {
    require(path.resolve(policyPath)).invokeRolesPolicies();
  });
};

/**
 * Configure the modules server routes
 */
module.exports.initModulesServerRoutes = function(app) {
  winston.info('Initializing Modules Server Routes...');
  // Globbing routing files
  config.files.server.routes.forEach(function(routePath) {
    require(path.resolve(routePath))(app);
  });
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = function(app) {
  winston.info('Initializing Error Routes...');
  app.use(function(err, req, res, next) {
    // If the error object doesn't exists
    if (!err) {
      return next();
    }

    // Log it
    console.error(err.stack);

    // Redirect to error page
    res.redirect('/server-error');
  });
};

/**
 * Configure Socket.io
*/

module.exports.configureSocketIO = function(app, db) {
  winston.info('Initializing Socket.io...');
  // Load the Socket.io configuration
  var server = require('./socket.io')(app, db);

  // Return server object
  return server;
};

/**
 * Configure server response languages
 */
module.exports.configureLanguages = function(app) {
  winston.info('Initializing Languages ...');
  // Globbing routing files
  try{
    fs.readdir(language_folder_path, function(err, files){
      //console.log(files);
      files.forEach(function(file){
        var lang = require(path.resolve(language_folder_path+file));
        if(lang.language_code && lang.language_name && lang.language_variables)
          global.languages[''+lang.language_code+''] = lang;
      });
      //console.log(languages);
    });
  }catch(error){
    console.log(error);
  }
};

/**
 * Initialize the Express application
 */
module.exports.init = function(db) {
  // Initialize express app
  var app = express();

  // Initialize local variables
  this.initLocalVariables(app);

  // Initialize Express middleware
  this.initMiddleware(app);

  // Initialize Express view engine
  this.initViewEngine(app);

  // Initialize Express session
  this.initSession(app, db);

  // Initialize Modules configuration
  this.initModulesConfiguration(app);

  // Initialize Helmet security headers
  this.initHelmetHeaders(app);

  // Initialize modules static client routes
  this.initModulesClientRoutes(app);

  // Initialize modules server authorization policies
  this.initModulesServerPolicies(app);

  // Initialize modules server routes
  this.initModulesServerRoutes(app);

  // Configure Languages
  this.configureLanguages(app);

  // Initialize error routes
  this.initErrorRoutes(app);

  // Configure Socket.io
  app = this.configureSocketIO(app, db);

  return app;
};
