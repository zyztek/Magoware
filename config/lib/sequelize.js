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

const os = require('os');
const api_list = require(path.resolve("./config/api_list.json"));
const default_device_menu = require(path.resolve("./config/defaultvalues/device_menu.json"));
const default_activity = require(path.resolve("./config/defaultvalues/activity.json"));
const default_app_groups = require(path.resolve("./config/defaultvalues/app_groups.json"));
const default_package_type = require(path.resolve("./config/defaultvalues/package_type.json"));
const default_api_group = require(path.resolve("./config/defaultvalues/api_group.json"));
const default_api_url = require(path.resolve("./config/defaultvalues/api_url.json"));

db.Sequelize = Sequelize;
db.models = {};
db.discover = [];

// Expose the connection function
db.connect = function(database, username, password, options) {

    if (typeof db.logger === 'function')
        winston.info("Connecting to: " + database + " as: " + username);

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
            //sequelize.sync({force: true}) //deletes database and recreates all tabels with default values

            //sequelize.sync()
            sequelize.sync({force: (process.env.DB_SYNC_FORCE === 'true')})
                .then(function() {
                    async.waterfall([
                        //create admin group
                        function(callback){
                            db.models['groups'].findOrCreate({
                                where: {code: 'admin'},
                                defaults: {
                                    name: 'Administrator',
                                    code: 'admin',
                                    isavailable: 1
                                }
                            }).then(function(group) {
                                winston.info('Admin group created successfully');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating Admin group');
                                callback(null);
                            });
                        },
                        //create admin user
                        function(callback) {
                            var salt = randomstring.generate(64);
                            db.models['users'].findOrCreate({
                                where: {username: 'admin'},
                                defaults: {
                                    username: 'admin',
                                    password: 'admin',
                                    hashedpassword: authentication.encryptPassword('admin', salt),
                                    salt: salt,
                                    isavailable: 1,
                                    group_id: 1
                                }
                            }).then(function(user) {
                                winston.info('Admin user created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating Admin user');
                                callback(null);
                            });
                        },
                        //create settings record
                        function(callback){
                            db.models['settings'].findOrCreate({
                                where: {id:1},
                                defaults: {
                                    id: 1,
                                    email_address: 'noreply@demo.com',
                                    email_username: 'username',
                                    email_password: 'password',
                                    assets_url: (networking.external_serverip()) ? networking.external_serverip() : 'your_server_url',
                                    old_encryption_key: '0123456789abcdef',
                                    new_encryption_key: '0123456789abcdef',
                                    activity_timeout: 10800,
                                    channel_log_time:6,
                                    log_event_interval:300,
                                    vodlastchange: Date.now(),
                                    livetvlastchange: Date.now(),
                                    menulastchange: Date.now()
                                }
                            }).then(function(settins) {
                                winston.info('Settings created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.error("An error occured: %j", err);
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['vod_stream_source'].findOrCreate({
                                where: {id: 1},
                                defaults: {id:1,description: 'VOD Streams Primary CDN'}
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
                            var protocol = (config.port === 443) ? 'https://' : 'http://'; //port 443 means we are running https, otherwise we are running http (preferably on port 80)
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
                //Populating app_group table
                db.models['app_group'].bulkCreate(
                    default_app_groups
                ).then(function(done) {
                    winston.info('Default app_groups data created successfuly.');
                    return null;
                }).catch(function(err) {
                    winston.info('Error creating app_group items.',err);
                    return null;
                });
                return null;
            }).then(function() {
                //Populating activity table
                db.models['activity'].bulkCreate(
                    default_activity
                ).then(function(done) {
                    winston.info('Default activity data created successfuly.');
                    return null;
                }).catch(function(err) {
                    winston.info('Error creating activity itmes',err);
                    return null;
                });
                return null;
            }).then(function() {
                //Populating main menu items
                db.models['device_menu'].bulkCreate(
                    default_device_menu
                ).then(function(done) {
                    winston.info('Default menu created successfuly.');
                    return null;
                }).catch(function(err) {
                    winston.info('Error creating Deafult Menu',err);
                    return null;
                });
                return null;
            }).then(function() {
                //Populating app_group table
                db.models['package_type'].bulkCreate(
                    default_package_type
                ).then(function(done) {
                    winston.info('Default package_type data created successfuly.');
                    return null;
                }).catch(function(err) {
                    winston.info('Error creating package_type items.',err);
                    return null;
                });
                return null;
            }).then(function() {
                //Populating api_group table
                db.models['api_group'].bulkCreate(
                    default_api_group
                ).then(function(done) {
                    winston.info('Default api_group data created successfuly.');
                    return null;
                }).catch(function(err) {
                    winston.info('Error creating api_group items.',err);
                    return null;
                });
                return null;
            }).then(function() {
                //Populating api_url table
                db.models['api_url'].bulkCreate(
                    default_api_url
                ).then(function(done) {
                    winston.info('Default api_url data created successfuly.');
                    return null;
                }).catch(function(err) {
                    winston.info('Error creating api_url items.',err);
                    return null;
                });
                return null;
            }).then(function() {
                    var schedule = require(path.resolve("./modules/deviceapiv2/server/controllers/schedule.server.controller.js"));
                    schedule.reload_scheduled_programs(); //reloading the scheduled future programs into the event loop
                })
                .catch(function(err) {
                    winston.error("An error occured: %j", err);
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
