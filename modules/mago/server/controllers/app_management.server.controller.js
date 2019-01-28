'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
    winston = require('winston'),
  DBModel = db.app_management,
    fs = require('fs');

/**
 * Create
 */
exports.create = function(req, res) {

  DBModel.create(req.body).then(function(result) {
    if (!result) {
      return res.status(400).send({message: 'fail create data'});
    } else {
      return res.jsonp(result);
    }
  }).catch(function(err) {
    winston.error("Saving the application data failed with error: ", err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Show current
 */
exports.read = function(req, res) {
  res.json(req.appManagement);
};

/**
 * Update
 */
exports.update = function(req, res) {

    var updateData = req.appManagement;

    if(updateData.url != req.body.url) {
        var deletefile = path.resolve('./public'+updateData.url);
    }

  updateData.updateAttributes(req.body).then(function(result) {
      if(deletefile) {
          fs.unlink(deletefile, function (err) {
              //todo: return some response?
          });
      }
    res.json(result);
  }).catch(function(err) {
    winston.error("Updating the application data failed with error: ", err);
    req.body.url=url_fields[0];
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};


/**
 * Delete
 */
exports.delete = function(req, res) {
  var deleteData = req.appManagement;

  DBModel.findById(deleteData.id).then(function(result) {
    if (result) {

      result.destroy().then(function() {
        return res.json(result);
      }).catch(function(err) {
        winston.error("Deletingt teh application data failed with error: ", err);
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
    winston.error("Finding the application data failed with error: ", err);
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

    if(query.q) {
    qwhere.$or = {};
    qwhere.$or.title = {};
    qwhere.$or.title.$like = '%'+query.q+'%';
  }

  //start building where
  final_where.where = qwhere;
  if(parseInt(query._start)) final_where.offset = parseInt(query._start);
  if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
  if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
  final_where.include = [];
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
    winston.error("Getting the application list failed with error: ", err);
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
    include: []
  }).then(function(result) {
    if (!result) {
      return res.status(404).send({
        message: 'No data with that identifier has been found'
      });
    } else {
      req.appManagement = result;
      next();
      return null;
    }
  }).catch(function(err) {
    winston.error("Getting the application's data failed with error: ", err);
    return next(err);
  });

};
