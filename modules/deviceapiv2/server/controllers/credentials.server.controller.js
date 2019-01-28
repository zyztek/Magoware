'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    response = require(path.resolve("./config/responses.js")),
    password_encryption = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller.js')),
    push_msg = require(path.resolve('./custom_functions/push_messages')),
    crypto = require('crypto'),
    models = db.models;
    var async = require("async");

/**
 * @api {post} /apiv2/credentials/login /apiv2/credentials/login
 * @apiVersion 0.2.0
 * @apiName DeviceLogin
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} username Customers login username.
 * @apiParam {String} password Customers login password.
 * @apiParam {String} boxid Unique device ID.
 *
 * @apiDescription If token is not present, plain text values are used to login
 */
exports.login = function(req, res) {
    var appids = [];


    if (req.auth_obj.username === 'guest') {
        models.devices.upsert({
            device_active: true,
            login_data_id: req.thisuser.id,
            username: req.auth_obj.username,
            device_mac_address: decodeURIComponent(req.body.macaddress),
            appid: req.auth_obj.appid,
            app_name: (req.body.app_name) ? req.body.app_name : '',
            app_version: req.body.appversion,
            ntype: req.body.ntype,
            device_id: req.auth_obj.boxid,
            hdmi: (req.body.hdmi == 'true') ? 1 : 0,
            firmware: decodeURIComponent(req.body.firmwareversion),
            device_brand: decodeURIComponent(req.body.devicebrand),
            screen_resolution: decodeURIComponent(req.body.screensize),
            api_version: decodeURIComponent(req.body.api_version),
            device_ip: req.ip.replace('::ffff:', ''),
            os: decodeURIComponent(req.body.os)
        }).then(function (result) {
            var response_data = [{"encryption_key": req.app.locals.settings.new_encryption_key}];
            response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
        }).catch(function (error) {
            winston.error("Creating / updating the device record for guest account failed with error: ", error);
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION_1', 'DATABASE_ERROR_DATA', 'no-store');
        });
    }
    else {
        //login start
        models.login_data.findOne({
            where: {username: req.auth_obj.username},
            attributes: ['id', 'username', 'password', 'account_lock', 'salt']
        }).then(function (users) {
            if (password_encryption.authenticate(req.auth_obj.password, req.thisuser.salt, req.thisuser.password) === false) {
                response.send_res(req, res, [], 704, -1, 'WRONG_PASSWORD_DESCRIPTION', 'WRONG_PASSWORD_DATA', 'no-store');
            }
            else {
                models.devices.findOne({
                    where: {username: req.auth_obj.username, device_active: true, appid: {in: appids}}
                }).then(function (device) {
                    //if record is found then device is found

                    var max_multilogin_nr = req.app.locals.advancedsettings.filter(function(obj) {
                        return obj.parameter_id === "max_multilogin_nr"
                    })[0].parameter_value;

                    if(!device || device.length < Number(max_multilogin_nr)) {
                        models.devices.upsert({
                            device_active:      true,
                            login_data_id:		users.id,
                            username:           req.auth_obj.username,
                            device_mac_address: decodeURIComponent(req.body.macaddress),
                            appid:              req.auth_obj.appid,
                            app_name:           (req.body.app_name) ? req.body.app_name : '',
                            app_version:        req.body.appversion,
                            ntype:              req.body.ntype,
                            device_id:          req.auth_obj.boxid,
                            hdmi:               (req.body.hdmi=='true') ? 1 : 0,
                            firmware:           decodeURIComponent(req.body.firmwareversion),
                            device_brand:       decodeURIComponent(req.body.devicebrand),
                            screen_resolution:  decodeURIComponent(req.body.screensize),
                            api_version:        decodeURIComponent(req.body.api_version),
                            device_ip:          req.ip.replace('::ffff:', ''),
                            os:                 decodeURIComponent(req.body.os),
                            googleappid:        req.body.googleappid
                        }).then(function (result) {
                            var response_data = [{"encryption_key": req.app.locals.settings.new_encryption_key}];
                            response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
                            return null;
                        }).catch(function (error) {
                            winston.error("Updating a device's record failed with error: ", error);
                            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION_2', 'DATABASE_ERROR_DATA', 'no-store');
                        });
                    }
                    else {
                        response.send_res(req, res, [], 705, -1, 'DUAL_LOGIN_ATTEMPT_DESCRIPTION', 'DUAL_LOGIN_ATTEMPT_DATA', 'no-store'); //same user try to login on another device
                    }
                    return null;
                }).catch(function (error) {
                    winston.error("Searching for the logged device failed with error: ", error);
                    response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION_4', 'DATABASE_ERROR_DATA', 'no-store');
                });
            }
            return null;
        }).catch(function (error) {
            winston.error("Searching for the credentials of the client's account failed with error: ", error);
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION_5', 'DATABASE_ERROR_DATA', 'no-store');
        });
    }

};


/**
 * @api {post} /apiv2/credentials/logout /apiv2/credentials/logout
 * @apiVersion 0.2.0
 * @apiName DeviceLogout
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Removes check box from device so user can login on another device
 */
exports.logout = function(req, res) {
    models.devices.update(
        {
            device_active: false
        },
        {
            where: { username : req.auth_obj.username, appid : req.auth_obj.appid, device_id: req.auth_obj.boxid}
        }).then(function (result) {
        response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        winston.error("Setting device inactive failed with error: ", error);
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

/**
 * @api {post} /apiv2/credentials/logout_user /apiv2/credentials/logout_user
 * @apiVersion 0.2.0
 * @apiName LogoutUser
 * @apiGroup DeviceAPI
 * @apiParam {String} auth Encrypted authentication token string.
 * @apiDescription Logs user out of devices of the same group as this. (Updates device_active flag to false, sends push notification to log user out)
 * @apiSuccessExample Success-Response:
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1,
 *       "error_description": "OK",
 *       "extra_data": "LOGOUT_OTHER_DEVICES",
 *       "response_object": []
 *      }
 * @apiErrorExample Error-Response:
 *     {
 *       "status_code": 704,
 *       "error_code": -1,
 *       "timestamp": 1,
 *       "error_description": "REQUEST_FAILED",
 *       "extra_data": "Error processing request",
 *       "response_object": []
 *     }
 * @apiErrorExample Error-Response:
 *     {
 *       "status_code": 704,
 *       "error_code": -1,
 *       "timestamp": 1,
 *       "error_description": "REQUEST_FAILED",
 *       "extra_data": "Unable to find any device with the required specifications",
 *       "response_object": []
 *     }
 * @apiErrorExample Error-Response:
 *     {
 *       "status_code": 704,
 *       "error_code": -1,
 *       "timestamp": 1,
 *       "error_description": "DATABASE_ERROR",
 *       "extra_data": "Error connecting to database",
 *       "response_object": []
 *     }
 */
exports.logout_user = function(req, res) {

    //find devices of same group where user is logged in
    models.devices.findOne({
        attributes: ['googleappid'],
        where: {username : req.auth_obj.username, device_active: true},
        order: [['updatedAt', 'ASC']] //log out first device that has been logged in
    }).then(function(devices){
        //log this user out of the devices of this group
        async.forEach(devices, function(device, callback){
            //update device status
            models.devices.update(
                {device_active: false}, {where: { googleappid: device.googleappid}}
            ).then(function (result) {
                //send push message to log devices out
                var message = new push_msg.ACTION_PUSH('Action', "You have been logged in another device", '5', "logout_user");
                push_msg.send_notification(device.googleappid, req.app.locals.backendsettings.firebase_key, '', message, 5, false, true, function(result){});
                callback(null);
                return null;
            }).catch(function(error) {
                winston.error("Setting device as inactive failed with error: ", error);
            });
        }, function(error){
            if(!error) response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'LOGOUT_OTHER_DEVICES', 'no-store');
            else response.send_res(req, res, [], 704, -1, 'REQUEST_FAILED', 'REQUEST_FAILED_DESC', 'no-store');
        });
        return null;
    }).catch(function(error){
        winston.error("Getting a list of googleappids failed with error: ", error);
        response.send_res(req, res, [], 704, -1, 'REQUEST_FAILED', 'DEVICE_NOT_FOUND', 'no-store');
    });

};

//Sends an action push message to all active devices where this user is loged in
exports.lock_account = function lock_account(login_id, username) {

    models.devices.findAll({
        attributes: ['googleappid', 'app_version', 'appid'], where: {login_data_id: login_id, device_active: true}
    }).then(function (result) {
        if(result && result.length>0){
            var min_ios_version = (company_configurations.ios_min_version) ? parseInt(company_configurations.ios_min_version) : parseInt('1.3957040');
            var android_phone_min_version = (company_configurations.android_phone_min_version) ? parseInt(company_configurations.android_phone_min_version) : '1.1.2.2';
            var min_stb_version = (company_configurations.stb_min_version) ? parseInt(company_configurations.stb_min_version) : '2.2.2';
            var android_tv_min_version = (company_configurations.android_tv_min_version) ? parseInt(company_configurations.android_tv_min_version) : '6.1.3.0';
            for(var i=0; i<result.length; i++){
                if(result[i].appid === 1 && result[i].app_version >= min_stb_version) var message = new push_msg.ACTION_PUSH('Action', "Your account was locked", '5', "lock_account");
                else if(result[i].appid === 2 && result[i].app_version >= android_phone_min_version) var message = new push_msg.ACTION_PUSH('Action', "Your account was locked", '5', "lock_account");
                else if(parseInt(result[i].appid) === parseInt('3') && parseInt(result[i].app_version) >= min_ios_version)
                    var message = new push_msg.ACTION_PUSH('Action', "Your account was locked", '5', "lock_account");
                else if(result[i].appid === 4 && result[i].app_version >= android_tv_min_version) var message = new push_msg.ACTION_PUSH('Action', "Your account was locked", '5', "lock_account");
                else if(['5', '6'].indexOf(result[i].appid))
                    var message = new push_msg.ACTION_PUSH('Action', "Your account was locked", '5', "lock_account");
                else var message = {"action": "lock_account", "parameter1": "", "parameter2": "", "parameter3": ""};
                push_msg.send_notification(result[i].googleappid, req.app.locals.backendsettings.firebase_key, username, message, 5, false, true, function(result){});
            }
        }
    }).catch(function(error) {
        winston.error("Getting a list of device data failed with error: ", error);
    });

};