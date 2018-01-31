'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.payment_transactions;


/**
 * Show current
 */
exports.read = function(req, res) {
    res.json(req.paymentTransaction);
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
            req.paymentTransaction = result;
            req.paymentTransaction.full_log = JSON.parse(result.full_log);
            next();
            return null;
        }
    }).catch(function(err) {
        return next(err);
    });

};
