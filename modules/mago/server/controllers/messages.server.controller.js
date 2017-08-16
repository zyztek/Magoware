'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    apn = require('apn'),
    gcm = require('node-gcm'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.messages,
    DBDevices = db.devices;

function sendiosnotification(obj,messagein,ttl) {

  // Set up apn with the APNs Auth Key

  var apnProvider = new apn.Provider({
    token: {
      key: path.resolve('config/sslcertificate/IOS_APNs_82X366YY8N.p8'), // Path to the key p8 file
      keyId: '82X366YY8N', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
      teamId: 'RY4R7JL9MP', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
    },
    production: true // Set to true if sending a notification to a production iOS app
  });

  // Enter the device token from the Xcode console
  var deviceToken = obj.googleappid;

// Prepare a new notification
  var notification = new apn.Notification();

// Specify your iOS app's Bundle ID (accessible within the project editor)
  notification.topic = 'com.magoware.webtv';

// Set expiration to 1 hour from now (in case device is offline)
  notification.expiry = Math.floor(Date.now() / 1000) + ttl;

// Set app badge indicator
  notification.badge = 2;

// Play ping.aiff sound when the notification is received
  notification.sound = 'ping.aiff';

// Display the following message (the actual notification text, supports emoji)
  notification.alert = messagein;

// Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
  notification.payload = {id: 123};

// Actually send the notification
  apnProvider.send(notification, deviceToken).then(function(result) {
    // Check the result for any failed devices
  });
}

function sendandoirdnotification(obj, messagein, ttl, action, callback) {
  if(action == 'softwareupdate') {
    var message = new gcm.Message({
      data: {
        "SOFTWARE_INSTALL": messagein
      }
    });
  }
  else if(action == 'deletedata') {
    var message = new gcm.Message({
      data: {
        "DELETE_DATA": messagein
      }
    });
  }
  else if(action == 'deletesharedpreferences') {
    var message = new gcm.Message({
      data: {
        "DELETE_SHP": messagein
      }
    });
  }
  else {
    var message = new gcm.Message({
      timeToLive: ttl,
      data: {
        "CLIENT_MESSAGE": action
      }
    });
  }

  var sender = new gcm.Sender('AIzaSyDegTDot6Ked4cbTLF_TpQH6ZP2zNqgQ0o');
  var regTokens = [obj.googleappid];

  sender.send(message, { registrationTokens: regTokens }, function (err, response) {
    if(err) {
      callback(false);
    }
    else 	{
      save_messages(obj, messagein, ttl, action)
      callback(true);
    }
  });
}

function save_messages(obj, messagein, ttl, action, callback){

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
  var andcondition = {};
  var orcondition = [];

  andcondition.login_data_id = req.body.username;
  if(req.body.sendtoactivedevices) {
    andcondition.device_active = 1;
  }

  if(req.body.toios) {
    orcondition[0] = {};
    orcondition[0].appid  = 3;
  }
  if(req.body.toandroidsmartphone) {
    orcondition[1] = {};
    orcondition[1].appid  = 2;
  }
  if(req.body.toandroidbox) {
    orcondition[2] = {};
    orcondition[2].appid  = 1;
  }
  DBDevices.findAll(
      {
        where: {
          $and: andcondition,
          $or: orcondition
        },
        include: [{model: db.login_data, required: true, where: {get_messages: true}}]
      }
  ).then(function(result) {
    if (!result) {
      return res.status(401).send({
        message: 'no records found'
      });
    } else {
      for(var key in result) {
        var obj = result[key];

        if(obj.appid == 1 ) {
          sendandoirdnotification(obj,req.body.message,req.body.timetolive,req.body.message,function(result){});
        }
        if(obj.appid == 2 ) {
          sendandoirdnotification(obj,req.body.message,req.body.timetolive,req.body.message,function(result){});
        }
        if(obj.appid == 3 ) {
          sendiosnotification(obj,req.body.message,req.body.timetolive)
        }
      }
      return res.status(200).send({
        message: 'Message sent'
      });
    }


  });


};

/**
 * Send Message Actions, update, refresh, delete
 *
 */

exports.send_message_action = function(req, res) {

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
      sendandoirdnotification(result,'some doemo message',5,req.body.messageaction,function(result){
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

  console.log("--------------- List ------------------")
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
