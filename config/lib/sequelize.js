"use strict";

var
    path = require('path'),
    config = require(path.resolve('./config/config')),
    Sequelize = require('sequelize'),
    winston = require('./winston'),
    async = require('async'),
    db = {},
    http = require('http'),
    https = require('https'),
    chalk = require('chalk'),
    randomstring = require('randomstring'),
    networking = require(path.resolve('./custom_functions/networking')),
    authentication = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller'));

    var salt = randomstring.generate(64);
    var protocol = (config.port === 443) ? 'https://' : 'http://'; //port 443 means we are running https, otherwise we are running http (preferably on port 80)

    const os = require('os');
    const api_list = require(path.resolve("./config/api_list.json"));
    const default_device_menu = require(path.resolve("./config/defaultvalues/device_menu.json"));
    const default_activity = require(path.resolve("./config/defaultvalues/activity.json"));
    const default_app_groups = require(path.resolve("./config/defaultvalues/app_groups.json"));
    const default_package_type = require(path.resolve("./config/defaultvalues/package_type.json"));
    const default_api_group = require(path.resolve("./config/defaultvalues/api_group.json"));
    const default_api_url = require(path.resolve("./config/defaultvalues/api_url.json"));
    const admin_group = {name: 'Administrator', code: 'admin', isavailable: 1};
    const admin_user = {username: 'admin', password: 'admin', hashedpassword: 'admin', salt: salt, isavailable: 1, group_id: 1};
    const settings_values = {
        id: 1,
        email_address: 'noreply@demo.com',
        email_username: 'username',
        email_password: 'password',
        assets_url: (networking.external_serverip()) ? protocol+networking.external_serverip() : 'your_server_url',
        old_encryption_key: '0123456789abcdef',
        new_encryption_key: '0123456789abcdef',
        firebase_key: '',
        help_page: '/help_and_support',
        vod_subset_nr: 200,
        activity_timeout: 10800,
        channel_log_time:6,
        log_event_interval:300,
        vodlastchange: Date.now(),
        livetvlastchange: Date.now(),
        menulastchange: Date.now(),
        akamai_token_key: 'akamai_token_key',
        flussonic_token_key: 'flussonic_token_key'
    }

    db.Sequelize = Sequelize;
    db.models = {};
    db.discover = [];

// Expose the connection function
db.connect = function(database, username, password, options) {

    if (typeof db.logger === 'function') winston.info("Connecting to: " + database + " as: " + username);

    // Instantiate a new sequelize instance
    var sequelize = new db.Sequelize(database, username, password, options);

    db.discover.forEach(function(location) {
        var model = sequelize["import"](location);
        if (model)
            db.models[model.name] = model;
    });

    sequelize.authenticate().then(function(results) {

        // Execute the associate methods for each Model
        Object.keys(db.models).forEach(function(modelName) {
            if (db.models[modelName].options.hasOwnProperty('associate')) {
                db.models[modelName].options.associate(db.models);
                //winston.info("Associating Model: " + modelName);
            }
        });

        if (config.db.sync) {

            sequelize.sync({force: (process.env.DB_SYNC_FORCE === 'true')})
                .then(function() {
                    async.waterfall([
                        //create admin group
                        function(callback){
                            db.models['groups'].findOrCreate({
                                where: {code: 'admin'},defaults: admin_group
                            }).then(function(group) {
                                winston.info('Admin group created successfully. Creating user admin ...');
                                //create admin user
                                db.models['users'].findOrCreate({
                                    where: {username: 'admin'}, defaults: admin_user
                                }).then(function(user) {
                                    winston.info('Admin user created successfully.');
                                    callback(null);
                                    return null;
                                }).catch(function(err) {
                                    winston.info('Error creating Admin user');
                                    callback(null);
                                });
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating Admin group');
                                callback(null);
                            });
                        },
                        //create settings record
                        function(callback){
                            db.models['settings'].findOrCreate({
                                where: {id:1}, defaults: settings_values
                            }).then(function(settings) {
                                winston.info('Settings created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.error("An error occured: ", err);
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['vod_stream_source'].findOrCreate({
                                where: {id: 1}, defaults: {id:1,description: 'VOD Streams Primary CDN'}
                            }).then(function(done) {
                                winston.info('VOD stream source created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating VOD stream source');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['channel_stream_source'].findOrCreate({
                                where: {id: 1},
                                defaults: {id:1,stream_source: 'Live Streams Primary CDN'}
                            }).then(function(done) {
                                winston.info('Live TV stream source created successfully.');
                                callback(null);
                            }).catch(function(err) {
                                winston.info('Error creating Live TV stream source');
                                callback(null);
                            });
                        },
                        function(callback){
                            var baseurl = process.env.NODE_HOST || 'localhost' + ":" + config.port;
                            var apiurl = (baseurl == 'localhost:'+config.port) ? protocol+baseurl+'/apiv2/schedule/reload' : baseurl+'/apiv2/schedule/reload'; //api path
                            try {
                                if(config.port === 443){
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //invalid ssl certificate ignored
                                    https.get(apiurl, function(resp){
                                        callback(null);
                                    }).on("error", function(e){
                                        callback(null); //return offset 0 to avoid errors
                                    });
                                }
                                else{
                                    http.get(apiurl, function(resp){
                                        callback(null);
                                    }).on("error", function(e){
                                        callback(null); //return offset 0 to avoid errors
                                    });
                                }
                            } catch(e) {
                                callback(null); //catch error 'Unable to determine domain name' when url is invalid / key+service are invalid
                            }
                        }
                    ],function(err) {
                        if (err) {
                            return next(err);
                        }
                    });
                    winston.info("Database synchronized");
                    return null;
                }).then(function() {
                    //Populating activity table
                    async.forEach(default_activity, function(activity_obj, callback){
                        db.models['activity'].findOrCreate({
                            where: Sequelize.or({id: activity_obj.id}, {description: activity_obj.description}), defaults: activity_obj
                        }).then(function(done) {
                            winston.info('Activity '+activity_obj.description+' created successfuly.');
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.info('Error creating activity '+activity_obj.description+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default activities created successfully. Creating App group table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                    //Populating app_group table
                    async.forEach(default_app_groups, function(app_group_obj, callback){
                        db.models['app_group'].findOrCreate({
                            where: {id: app_group_obj.id}, defaults: app_group_obj
                        }).then(function(done) {
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.info('Error creating app group with id '+app_group_obj.id+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default app groups created successfully. Creating package_type table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                    async.forEach(default_package_type, function(package_type_obj, callback){
                        db.models['package_type'].findOrCreate({
                            where: {id: package_type_obj.id}, defaults: package_type_obj
                        }).then(function(done) {
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.info('Error creating package type '+package_type_obj.description+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default package_types created successfully. Creating device menu table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                    async.forEach(default_device_menu, function(device_menu_obj, callback){
                        db.models['device_menu'].findOrCreate({
                            where: {id: device_menu_obj.id}, defaults: device_menu_obj
                        }).then(function(done) {
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.info('Error creating menu '+device_menu_obj.description+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default menus created successfully. Creating device api group table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                    //Populating api_group table
                    async.forEach(default_api_group, function(api_group_obj, callback){
                        db.models['api_group'].findOrCreate({
                            where: {id: api_group_obj.id}, defaults: api_group_obj
                        }).then(function(done) {
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.info('Error creating api group '+api_group_obj.api_group_name+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default api groups created successfully. Creating device api group table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                    //Populating api_group table
                    async.forEach(default_api_url, function(api_url_obj, callback){
                        db.models['api_url'].findOrCreate({
                            where: Sequelize.and({api_url: api_url_obj.api_url}, {api_group_id: api_url_obj.api_group_id}), defaults: api_url_obj
                        }).then(function(done) {
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.info('Error creating api url '+api_url_obj.api_url+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default api urls created successfully.');
                        return null;
                    });
                    return null;
                }).then(function() {
                    var schedule = require(path.resolve("./modules/deviceapiv2/server/controllers/schedule.server.controller.js"));
                    schedule.reload_scheduled_programs(); //reloading the scheduled future programs into the event loop
                    return null;
                }).catch(function(err) {
                    winston.error("An error occured: ", err);
                    return null;
                });
        }
        else{
            var schedule = require(path.resolve("./modules/deviceapiv2/server/controllers/schedule.server.controller.js"));
            schedule.reload_scheduled_programs(); //reloading the scheduled future programs into the event loop
        }
        return null;
    }).catch(function(error) {
        winston.error("Error connecting to database");
    });

    db.sequelize = sequelize;
    winston.info("Finished Connecting to Database");
    return true;
};

module.exports = db;
