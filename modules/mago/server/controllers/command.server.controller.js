'use strict';

var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    push_msg = require(path.resolve('./custom_functions/push_messages')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    winston = require('winston'),
    DBModel = db.commands,
    DBDevices = db.devices;

/**
 * @api {post} /api/ads Push messages - Send ads
 * @apiVersion 0.2.0
 * @apiName Send ads
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 *
 * @apiParam {String} type Field type. Value set [one, all].
 * @apiParam {Number} username  Field username.  If all_users is true, username can be left empty and is ignored.
 * @apiParam {Number[]} appid  Mandatory field appid. Cannot be an empty array.
 * @apiParam {boolean} sendtoactivedevices  Optional field sendtoactivedevices. If checked, send commands only to active devices.
 * @apiParam {String[]} command  Mandatory field command.
 * @apiParam {String} parameter1  Mandatory field parameter1. Represents target directory for command. When not needed, set it as empty string
 * @apiParam {String} parameter2  Optional field parameter2. Represents destination directory for command. When not needed, set it as empty string
 * @apiParam {String} parameter3  Optional field parameter3. Represents other command options. When not needed, set it as empty string
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Message sent"
 *      }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 OK
 *     {
 *       "message": "Error message" //for the actual message refer to list below
 *     }
 *
 *      "You did not select any devices" //User type was set to 'One user' but no user was selected
 *      "You did not select any device types" //appid is missing, empty or invalid
 *      "No devices found with these filters" //no device or username fullfills the filters
 *

 */

/**
 * Create
 */
exports.create = function(req, res) {
    var no_users = (req.body.type === "one" && req.body.username === null) ? true : false; //no users selected for single user messages, don't send push
    if(no_users){
        return res.status(400).send({
            message: 'You did not select any devices'
        });
    }
    else{
        var where = {}; //the device filters will be passed here

        if(req.body.type === "one") {
            if(req.body.macadress) where.device_mac_address = req.body.macadress;
            else if(req.body.wifi) where.device_wifimac_address = req.body.wifi;
            else where.login_data_id = req.body.username; //if only one user is selected, filter devices of that user
        }

        if (req.body.appid && req.body.appid.length > 0) {
            var device_types = [];
            for(var j=0; j<req.body.appid.length; j++) device_types.push(parseInt(req.body.appid[j]));
        }
        else return res.status(400).send({ message: "You did not select any device types" });

        if(req.body.sendtoactivedevices) where.device_active = true; //if we only want to send push msgs to active devices, add condition
        where.appid = {in: device_types}; //filter devices by application id

        DBDevices.findAll(
            {
                attributes: ['googleappid', 'appid', 'app_version'],
                where: where,
                include: [{model: db.login_data, attributes: ['username'], required: true, raw: true, where: {get_messages: true}}]
            }
        ).then(function(result) {
            if (!result || result.length === 0) {
                return res.status(401).send({
                    message: 'No devices found with these filters'
                });
            } else {
                if(req.body.command === 'login_user'){
                    var fcm_tokens = [];
                    var users = [];
                    var parameters = {
                            "username": result[0].login_datum.username,
                            "password": req.body.password
                    };
                    var message = new push_msg.ACTION_PUSH("Action", "Running action", '5', req.body.command, parameters);
                    for(var i=0; i<result.length; i++)
                        push_msg.send_notification(result[i].googleappid, req.app.locals.settings.firebase_key, result[i].login_datum.id, message, 5000, false, false, function(result){});
                }
                else if(req.body.command === 'show_username'){
                    var fcm_tokens = [];
                    var users = [];
                    var parameters = {
                            "username": result[0].login_datum.username,
                            "top": req.body.top,
                            "left": req.body.left
                    };
                    var message = new push_msg.INFO_PUSH("Action", "Performing an action", '6', parameters);
                    for(var i=0; i<result.length; i++)
                    push_msg.send_notification(result[i].googleappid, req.app.locals.settings.firebase_key, result[i].login_datum.id, message, 5000, true, false, function(result){});
                }
                else{
                    var fcm_tokens = [];
                    var users = [];
                    var min_ios_version = (company_configurations.ios_min_version) ? parseInt(company_configurations.ios_min_version) : parseInt('1.3957040');
                    var android_phone_min_version = (company_configurations.android_phone_min_version) ? parseInt(company_configurations.android_phone_min_version) : '1.1.2.2';
                    var min_stb_version = (company_configurations.stb_min_version) ? parseInt(company_configurations.stb_min_version) : '2.2.2';
                    var android_tv_min_version = (company_configurations.android_tv_min_version) ? parseInt(company_configurations.android_tv_min_version) : '6.1.3.0';
                    for(var i=0; i<result.length; i++){
                        if(result[i].appid === 1 && result[i].app_version >= min_stb_version)
                            var message = new push_msg.COMMAND_PUSH("Command", "Running command", '4', req.body.command, req.body.parameter1, req.body.parameter2, req.body.parameter3);
                        else if(result[i].appid === 2 && result[i].app_version >= android_phone_min_version)
                            var message = new push_msg.COMMAND_PUSH("Command", "Running command", '4', req.body.command, req.body.parameter1, req.body.parameter2, req.body.parameter3);
                        else if(parseInt(result[i].appid) === parseInt('3') && parseInt(result[i].app_version) >= min_ios_version)
                            var message = new push_msg.COMMAND_PUSH("Command", "Running command", '4', req.body.command, req.body.parameter1, req.body.parameter2, req.body.parameter3);
                        else if(result[i].appid === 4 && result[i].app_version >= android_tv_min_version)
                            var message = new push_msg.COMMAND_PUSH("Command", "Running command", '4', req.body.command, req.body.parameter1, req.body.parameter2, req.body.parameter3);
                        else if(['5', '6'].indexOf(result[i].appid))
                            var message = new push_msg.COMMAND_PUSH("Command", "Running command", '4', req.body.command, req.body.parameter1, req.body.parameter2, req.body.parameter3);
                        else var message = {
                                "action": req.body.command,
                                "parameter1": req.body.parameter1,
                                "parameter2": req.body.parameter2,
                                "parameter3": req.body.parameter3
                            };
                        push_msg.send_notification(result[i].googleappid, req.app.locals.settings.firebase_key, result[i].login_datum.id, message, req.body.timetolive, false, true, function(result){});
                    }
                }
                return res.status(200).send({
                    message: 'Message sent'
                });
            }
        });
    }
};

//returns list of commands stored in the database, for the listView
exports.list = function(req, res) {
    var query = {};
    var where = {};
    var join_where = {};

    if(req.query.status) where.status = req.query.status;
    if(req.query.command) where.command = {like: '%'+req.query.command+'%'};
    if(req.query.username) join_where.username = {like: '%'+req.query.username+'%'};

    query.attributes = ['id', 'googleappid', 'command', 'status', 'createdAt'];
    query.include = [{model: db.login_data, attributes: ['username'], required: true, where: join_where}];

    query.where = where;

    DBModel.findAndCountAll(query).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {
            res.setHeader("X-Total-Count", results.count);
            res.json(results.rows);
        }
    }).catch(function(err) {
        winston.error("Finding list of sent commands failed with error: ", err);
        res.jsonp(err);
    });
};
