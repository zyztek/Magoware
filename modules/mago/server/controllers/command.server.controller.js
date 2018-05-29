'use strict';

var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    push_msg = require(path.resolve('./custom_functions/push_messages')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.commands,
    DBDevices = db.devices;

/*
function save_messages(obj, messagein, ttl, action, callback){
    console.log("at save message")

    DBModel.create({
        username: obj.username,
        googleappid: obj.googleappid,
        title: messagein,
        message: messagein,
        action: action
    }).then(function(result) {
        if (!result) {
            console.log('Fail to create data')
        } else {
            console.log('Messages saved')
        }
    }).catch(function(err) {

    });

}
*/

/**
 * Create
 */
exports.create = function(req, res) {
    var no_users = (req.body.type === "one" && req.body.username === null) ? true : false; //no users selected for single user messages, don't send push
    var no_device_type = (req.body.toandroidsmartphone === false && req.body.toandroidbox === false  && req.body.toios === false) ? true : false; //no device types selected, don't send push
    if(no_users || no_device_type){
        return res.status(400).send({
            message: 'You did not select any devices'
        });
    }
    else{
        var where = {}; //the device filters will be passed here
        var appids = []; //appids that should receive the push will be held here
        if(req.body.type === "one") where.login_data_id = req.body.username; //if only one user is selected, filter devices of that user

        //for each selected device type, add appid in the list of appids
        if(req.body.toandroidbox) appids.push(1);
        if(req.body.toandroidsmartphone) appids.push(2);
        if(req.body.toios) appids.push(3);
        where.appid = {in: appids};

        if(req.body.sendtoactivedevices) where.device_active = true; //if we only want to send push msgs to active devices, add condition

        DBDevices.findAll(
            {
                attributes: ['googleappid', 'appid', 'app_version'],
                where: where,
                include: [{model: db.login_data, attributes: ['username'], required: true, raw: true, where: {get_messages: true}}],
                logging: console.log
            }
        ).then(function(result) {
            if (!result || result.length === 0) {
                return res.status(401).send({
                    message: 'No devices found with these filters'
                });
            } else {
                var fcm_tokens = [];
                var users = [];
                for(var i=0; i<result.length; i++){
                    if(result[i].appid === 1 && result[i].app_version >= '2.2.2')
                        var message = new push_msg.COMMAND_PUSH("Command", "Running command", '4', req.body.command, req.body.parameter1, req.body.parameter2, req.body.parameter3);
                    else if(result[i].appid === 2 && result[i].app_version >= '1.1.2.2')
                        var message = new push_msg.COMMAND_PUSH("Command", "Running command", '4', req.body.command, req.body.parameter1, req.body.parameter2, req.body.parameter3);
                    else if(parseInt(result[i].appid) === parseInt('3') && parseInt(result[i].app_version) >= parseInt('1.3957040'))
                        var message = new push_msg.COMMAND_PUSH("Command", "Running command", '4', req.body.command, req.body.parameter1, req.body.parameter2, req.body.parameter3);
                    else if(result[i].appid === 4 && result[i].app_version >= '6.1.3.0')
                        var message = new push_msg.COMMAND_PUSH("Command", "Running command", '4', req.body.command, req.body.parameter1, req.body.parameter2, req.body.parameter3);
                    else var message = {
                            "action": req.body.command,
                            "parameter1": req.body.parameter1,
                            "parameter2": req.body.parameter2,
                            "parameter3": req.body.parameter3
                        };
                    push_msg.send_notification(result[i].googleappid, req.app.locals.settings.firebase_key, result[i].login_datum.id, message, req.body.timetolive, false, true, function(result){});
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
        res.jsonp(err);
    });
};
