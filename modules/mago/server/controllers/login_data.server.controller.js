'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    winston = require('winston'),
    authenticationHandler = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  DBModel = db.login_data;

/**
 * @api {post} /api/logindata Create User account
 * @apiVersion 0.2.0
 * @apiName Create User account
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {Number} customer_id  Mandatory field customer_id.
 * @apiParam {String} username  Mandatory field username.
 * @apiParam {String} password  Mandatory field password.
 * @apiParam {String} pin  Mandatory field pin.
 * @apiParam {String} player  Mandatory field player.
 * @apiParam {Boolean} account_lock  Mandatory field account_lock.
 * @apiParam {Number} activity_timeout  Mandatory field activity_timeout.
 * @apiParam {Boolean} auto_timezone  Mandatory field auto_timezone. *
 * @apiParam {Number} timezone  Mandatory auto_timezone timezone. *
 * @apiParam {Boolean} beta_user  Mandatory field beta_user.
 * @apiParam {Number} channel_stream_source_id  Mandatory field channel_stream_source_id.
 * @apiParam {Number} vod_stream_source  Mandatory field vod_stream_source.
 * @apiParam {Boolean} get_messages  Mandatory field get_messages.*
 * @apiParam {Boolean} show_adult  Mandatory field show_adult.*
 *
 * @apiSuccess (200) {String} message Record created successfuly
 * @apiError (40x) {String} message Error message on creating the user account.
 *

 */
exports.create = function(req, res) {

  var newData = req.body;
    newData.salt = authenticationHandler.makesalt();
    logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));
    newData['updatedate'] = new Date();
    DBModel.create(newData).then(function(result) {
      if (!result) {
        return res.status(400).send({message: 'fail create data'});
      } else {
        return res.jsonp(result);
      }
    }).catch(function(err) {
      winston.error("Creating client account failed with error: ", err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Show current
 */
exports.read = function(req, res) {
  res.json(req.loginData);
};

/**
 * @api {put} /api/logindata/id Update User account
 * @apiVersion 0.2.0
 * @apiName Update User account
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {Number} customer_id  Optional field customer_id.
 * @apiParam {String} password  Optional field password.
 * @apiParam {String} pin  Optional field pin.
 * @apiParam {String} player  Optional field player.
 * @apiParam {Boolean} account_lock  Optional field account_lock.
 * @apiParam {Number} activity_timeout  Optional field activity_timeout.
 * @apiParam {Boolean} auto_timezone  Optional field auto_timezone.
 * @apiParam {Number} timezone  Optional field timezone.
 * @apiParam {Boolean} beta_user  Optional field beta_user.
 * @apiParam {Number} channel_stream_source_id  Optional field channel_stream_source_id.
 * @apiParam {Number} vod_stream_source  Optional field vod_stream_source.
 * @apiParam {Boolean} get_messages  Optional field get_messages.
 * @apiParam {Boolean} show_adult  Optional field show_adult.
 * @apiSuccess (200) {String} message Json of updated record
 * @apiError (40x) {Text} message {
 * "message": informing_message
 * }
 *

 */
exports.update = function(req, res) {

    if(req.body.updatevodtimestamp === true) {req.body.vodlastchange = Date.now(); }
    if(req.body.updatelivetvtimestamp === true) {req.body.livetvlastchange = Date.now(); }
    var updateData = req.loginData;
    logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));

    updateData.updateAttributes(req.body).then(function(result) {
        res.json(result);
    }).catch(function(err) {
      winston.error("Updating client account failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * Delete
 */
exports.delete = function(req, res) {
  var deleteData = req.loginData;

  DBModel.findById(deleteData.id).then(function(result) {
    if (result) {
      result.destroy().then(function() {
        return res.json(result);
      }).catch(function(err) {
        winston.error("Deleting client account failed with error: ", err);
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
    winston.error("Finding client account failed with error: ", err);
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

  if(query.customer_id) qwhere.customer_id = query.customer_id;
  if(query.login_id) qwhere.id = query.login_id;

  //search client account by username
  if (query.username) qwhere.username = query.username; //full text search
  else if (query.q) {
    qwhere.$or = {};
    qwhere.$or.username = {};
    qwhere.$or.username.$like = '%' + query.q + '%'; //partial search
  }

  //start building where
  final_where.where = qwhere;
  if(parseInt(query._end) !== -1){
    if(parseInt(query._start)) final_where.offset = parseInt(query._start);
    if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
  }
  if(query._orderBy) final_where.order = [[query._orderBy, query._orderDir]];
  final_where.include = [{model:db.customer_data,required:true}];
  //end build final where

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
    winston.error("Getting list of client accounts failed with error: ", err);
    res.jsonp(err);
  });
};

/**
 * Latest
 */
exports.latest = function(req, res) {
  DBModel.findAll({
    include: [db.customer_data],
    limit: 10,
    order: [['createdAt','ASC']]
  }).then(function(results) {
    if (!results) {
      return res.status(404).send({
        message: 'No data found'
      });
    } else {
      res.json(results);
    }
  }).catch(function(err) {
    winston.error("Getting latest client accounts failed with error: ", err);
    res.jsonp(err);
  });
};

/**
 * middleware
 */
exports.dataByID = function(req, res, next, id) {
  DBModel.findOne({
    where: {
        $or: {
            id: id,
            username: id
        }
    },
    include: [{model: db.customer_data}]
  }).then(function(result) {
    if (!result) {
      return res.status(404).send({
        message: 'No data with that identifier has been found'
      });
    } else {
      req.loginData = result;
      next();
      return null;
    }
  }).catch(function(err) {
    winston.error("Getting data for client account failed with error: ", err);
    return next(err);
  });

};

