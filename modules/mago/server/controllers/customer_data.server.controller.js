'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.customer_data;


/**
 * @api {post} /api/customerdata Create Customer
 * @apiVersion 0.2.0
 * @apiName Create Customer
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {Number} group_id  Mandatory field group_id.
 * @apiParam {String} firstname  Mandatory field firstname.
 * @apiParam {String} lastname  Mandatory field lastname.
 * @apiParam {String} email  Mandatory field email.
 * @apiParam {String} address  Mandatory field address.
 * @apiParam {String} city  Mandatory field city.
 * @apiParam {String} country  Mandatory field country.
 * @apiParam {String} telephone  Mandatory field telephone.
 * @apiSuccess (200) {String} message Record created successfuly
 * @apiError (40x) {String} message Error message on creating customer data.
 *

 */
exports.create = function(req, res) {
    logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));
    DBModel.create(req.body).then(function(result) {
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
  res.json(req.customerData);
};

/**
 * @api {put} /api/customerdata/id Update customer
 * @apiVersion 0.2.0
 * @apiName Update Customer
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {Number} group_id  Optional field group_id.
 * @apiParam {String} firstname  Optional field firstname.
 * @apiParam {String} lastname  Optional field lastname.
 * @apiParam {String} email  Optional field email.
 * @apiParam {String} address  Optional field address.
 * @apiParam {String} city  Optional field city.
 * @apiParam {String} country  Optional field country.
 * @apiParam {String} telephone  Optional field telephone.
 * @apiSuccess (200) {String} message Json of updated record
 * @apiError (40x) {Text} message {
 * "message": informing_message
 * }
 *

 */
exports.update = function(req, res) {

    var updateData = req.customerData;

    logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));
    updateData.updateAttributes(req.body).then(function(result) {
        res.json(result);
    }).catch(function(err) {
        console.log(err)
        return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * Delete
 */
exports.delete = function(req, res) {
  var deleteData = req.customerData;

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

  if(query.q) {
    qwhere.$or = {};
    qwhere.$or.firstname = {};
    qwhere.$or.firstname.$like = '%'+query.q+'%';
    qwhere.$or.lastname = {};
    qwhere.$or.lastname.$like = '%'+query.q+'%';
    qwhere.$or.email = {};
    qwhere.$or.email.$like = '%'+query.q+'%';
    qwhere.$or.address = {};
    qwhere.$or.address.$like = '%'+query.q+'%';
    qwhere.$or.city = {};
    qwhere.$or.city.$like = '%'+query.q+'%';
    qwhere.$or.country = {};
    qwhere.$or.country.$like = '%'+query.q+'%';
    qwhere.$or.telephone = {};
    qwhere.$or.telephone.$like = '%'+query.q+'%';
  }

  //start building where
  final_where.where = qwhere;
 if(parseInt(query._end) !== -1){
     if(parseInt(query._start)) final_where.offset = parseInt(query._start);
     if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
 }
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
    include: [db.login_data]
  }).then(function(result) {
    if (!result) {
      return res.status(404).send({
        message: 'No data with that identifier has been found'
      });
    } else {
      req.customerData = result;
      next();
      return null;
    }
  }).catch(function(err) {
    return next(err);
  });

};
