'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    response = require(path.resolve("./config/responses.js")),
    password_encryption = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller.js')),
    push_msg = require(path.resolve('./custom_functions/push_messages')),
    crypto = require('crypto'),
    models = db.models;

/**
 * @api {post} /apiv2/credentials/login /apiv2/credentials/login
 * @apiVersion 0.2.0
 * @apiName DeviceCheckLogin
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription If token is present, it is used to check login
 */

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

    models.app_group.findOne({
        attributes: ['app_group_id'],
        where: {app_id: req.auth_obj.appid}
    }).then(function (result) {
        models.app_group.findAll({
            attributes: ['app_id'],
            where: {app_group_id: result.app_group_id}
        }).then(function (result) {
            for(var i = 0; i<result.length; i++){
                appids.push(result[i].app_id);
            }
            //login start
            models.login_data.findOne({
                where: {username: req.auth_obj.username},
                attributes: [ 'id','username', 'password', 'account_lock', 'salt']
            }).then(function(users) {
                if (!users) {
                    //todo: this should be handled @token validation. for now it generates an empty response
                    response.send_res(req, res, [], 702, -1, 'USER_NOT_FOUND_DESCRIPTION', 'USER_NOT_FOUND_DATA', 'no-store');
                }
                else if (users.account_lock) {
                    //todo: this should be handled @token validation, though it does return a response
                    response.send_res(req, res, [], 703, -1, 'ACCOUNT_LOCK_DESCRIPTION', 'ACCOUNT_LOCK_DATA', 'no-store');
                }
                else if(password_encryption.authenticate(req.auth_obj.password, req.thisuser.salt, req.thisuser.password) === false) {
                    response.send_res(req, res, [], 704, -1, 'WRONG_PASSWORD_DESCRIPTION', 'WRONG_PASSWORD_DATA', 'no-store');
                }
                else  {
                    models.devices.findOne({
                        where: {username: req.auth_obj.username, device_active:true, appid:{in: appids}}
                    }).then(function(device){
                        //if record is found then device is found
                        if(device) {
                            if(req.auth_obj.boxid == device.device_id ) {
                                //same user login on same device
                                //update value of device_active, since a user is loging into this device
                                device.updateAttributes({
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
                                    os:                 decodeURIComponent(req.body.os)
                                }).then(function(result){
                                    var response_data = [{
                                        "encryption_key": req.app.locals.settings.new_encryption_key
                                    }];
                                    response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
                                    return null;
                                }).catch(function(error) {
                                    response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                                });
                            }
                            else {
                                response.send_res(req, res, [], 705, -1, 'DUAL_LOGIN_ATTEMPT_DESCRIPTION', 'DUAL_LOGIN_ATTEMPT_DATA', 'no-store'); //same user try to login on another device
                                return null;
                            }
                        }
                        else {
                            //fist time login, register on the database
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
                                os:                 decodeURIComponent(req.body.os)
                            }).then(function(result){
                                var response_data = [{
                                    "encryption_key": req.app.locals.settings.new_encryption_key
                                }];
                                response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
                                return null;
                            }).catch(function(error) {
                                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                            });

                        }
                        return null;
                    }).catch(function(error) {
                        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                    });
                }
                return null;
            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
            //login end
            return null;
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });


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
            where: { username : req.auth_obj.username, appid : req.auth_obj.appid}
        }).then(function (result) {
        response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

exports.logout_user = function(req, res) {
    var appids = []; //will store appids of devices of the same type

    //find type of device
    models.app_group.findOne({
        attributes: ['app_group_id'],
        where: {app_id: req.auth_obj.appid}
    }).then(function (result) {
        //find appids of the same group as this one
        models.app_group.findAll({
            attributes: ['app_id'],
            where: {app_group_id: result.app_group_id}
        }).then(function (result) {
            for(var i = 0; i<result.length; i++){
                appids.push(result[i].app_id);
            }
            //log this user out of devices of this type
            models.devices.update(
                {
                    device_active: false
                },
                {
                    where: { username : req.auth_obj.username, appid : {in: appids}}
                }).then(function (result) {
                response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'LOGOUT_OTHER_DEVICES', 'no-store');
            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
            return null;
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

//Sends an action push message to all active devices where this user is loged in
exports.lock_account = function lock_account(login_id, username) {
    models.settings.findOne({
        attributes: ['firebase_key']
    }).then(function (setting) {
        models.devices.findAll({
            attributes: ['googleappid', 'app_version', 'appid'], where: {login_data_id: login_id, device_active: true}
        }).then(function (result) {
            if(result && result.length>0){
                for(var i=0; i<result.length; i++){
                    if(result[i].appid === 1 && result[i].app_version >= '2.2.2') var message = new push_msg.ACTION_PUSH('Action', "Your account was locked", '5', "lock_account");
                    else if(result[i].appid === 2 && result[i].app_version >= '1.1.2.2') var message = new push_msg.ACTION_PUSH('Action', "Your account was locked", '5', "lock_account");
                    else if(parseInt(devices[i].appid) === parseInt('3') && parseInt(devices[i].app_version) >= parseInt('1.3957040'))
                        var message = new push_msg.ACTION_PUSH('Action', "Your account was locked", '5', "lock_account");
                    else if(result[i].appid === 4 && result[i].app_version >= '6.1.3.0') var message = new push_msg.ACTION_PUSH('Action', "Your account was locked", '5', "lock_account");
                    else var message = {"action": "lock_account", "parameter1": "", "parameter2": "", "parameter3": ""};
                    push_msg.send_notification(result[i].googleappid, setting.firebase_key, username, message, 5, false, true, function(result){});
                }
            }
        }).catch(function(error) {
            //unable to retrieve firebase tokens for this user, push notification not sent
        });
        return null;
    }).catch(function(error) {
        //could not read firebase server key, push notification not sent
    });
};