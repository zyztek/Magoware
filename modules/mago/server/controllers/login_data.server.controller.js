'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    authenticationHandler = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  DBModel = db.login_data;

/**
 * Create
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
 * Update
 */
exports.update = function(req, res) {

    if(req.body.updatevodtimestamp === true) {req.body.vodlastchange = Date.now(); }
    if(req.body.updatelivetvtimestamp === true) {req.body.livetvlastchange = Date.now(); }
    var updateData = req.loginData;
    logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));

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
  var deleteData = req.loginData;

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

  if(query.customer_id) qwhere.customer_id = query.customer_id;
  if(query.login_id) qwhere.id = query.login_id;
  if(query.q) {
    qwhere.$or = {};
    qwhere.$or.username = {};
    qwhere.$or.username.$like = '%'+query.q+'%';
  }

  //start building where
  final_where.where = qwhere;
  if(parseInt(query._start)) final_where.offset = parseInt(query._start);
  if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
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
    res.jsonp(err);
  });
};

/**
 * middleware
 */
exports.dataByID = function(req, res, next, id) {

  if ((id % 1 === 0) === false) { //check if it's integer
    return res.status(404).send({
      message: 'Data is invalid'
    });
  }

  DBModel.find({
    where: {
      id: id
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
    return next(err);
  });

};
