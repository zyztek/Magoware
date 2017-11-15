'use strict';

var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    push_msg = require(path.resolve('./custom_functions/push_messages')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.messages,
    DBDevices = db.devices;


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

/**
 * Create
 */
exports.create = function(req, res) {
  console.log("at create message")
  var no_users = (req.body.type === "one" && req.body.username === null) ? true : false; //no users selected for single user messages, don't send push
  var no_device_type = (req.body.toandroidsmartphone === false && req.body.toandroidbox === false  && req.body.toios === false) ? true : false; //no device types selected, don't send push

  if(no_users || no_device_type){
    return res.status(400).send({
      message: 'You did not select any devices'
    });
  }
  else{
    var message = {
      "event": "", "program_id": "", "channel_number": "", "event_time": "", "program_name": "", "description": req.body.message
    };
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
          attributes: ['googleappid'],
          where: where,
          include: [{model: db.login_data, attributes: ['username'], required: true, where: {get_messages: true}}],
          logging: console.log
        }
    ).then(function(result) {
      if (!result || result.length === 0) {
        return res.status(401).send({
          message: 'No devices found with these filters'
        });
      } else {
        var fcm_tokens = [];
        for(var i=0; i<result.length; i++){
          fcm_tokens.push(result[i].googleappid);
        }
        push_msg.send_notification(fcm_tokens, req.app.locals.settings.firebase_key, result, message, req.body.timetolive, true, true, function(result){});
        return res.status(200).send({
          message: 'Message sent'
        });
      }
    });
  }

};

/**
 * Send Message Actions, update, refresh, delete
 */

exports.send_message_action = function(req, res) {
  console.log("at send message action")

  DBDevices.find(
      {
        where: {
          id: req.body.deviceid,
          $or: [{appid: 1}, {appid: 2},{appid: 4} ]
        }
      }
  ).then(function(result) {
    if (!result) {
      return res.status(401).send({
        message: 'UserName or Password does not match'
      });
    } else {
      push_msg.sendnotification(result,'some doemo message',5,req.body.messageaction, true, function(result){
        if(result){
          return res.status(200).send({
            message: 'messge send successful but not saved in database'
          });
        }
        else {
          return res.status(404).send({
            message: 'messge not senddd'
          });
        }
      });

    }
  });

};


/**
 * Show current
 */
exports.read = function(req, res) {
  res.json(req.messages);
};

/**
 * Update
 */
exports.update = function(req, res) {
  var updateData = req.messages;

  updateData.updateAttributes(req.body).then(function(result) {
    res.json(result);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete
 */
exports.delete = function(req, res) {
  var deleteData = req.messages;

  DBModel.findById(deleteData.id).then(function(result) {
    if (result) {
      result.destroy().then(function() {
        return res.json(result);
      }).catch(function(err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      });
    } else {
      return res.status(400).send({
        message: 'Unable to find the Data'
      });
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });

};

/**
 * List
 */
exports.list = function(req, res) {
  var qwhere = {},
      final_where = {},
      query = req.query;

  //start building where
  final_where.where = qwhere;
  if(parseInt(query._start)) final_where.offset = parseInt(query._start);
  if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
  if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
  final_where.include = [];

  DBModel.findAndCountAll(

      final_where

  ).then(function(results) {
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

/**
 * middleware
 */
exports.dataByID = function(req, res, next, id) {

  DBModel.find({
    where: {
      id: id
    },
    include: []
  }).then(function(result) {
    if (!result) {
      return res.status(404).send({
        message: 'No data with that identifier has been found'
      });
    } else {
      req.messages = result;
      next();
      return null;
    }
  }).catch(function(err) {
    return next(err);
  });

};