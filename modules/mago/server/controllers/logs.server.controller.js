'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')),
    winston = require('winston'),
    DBModel = db.models.logs,
    refresh = require(path.resolve('./modules/mago/server/controllers/common.controller.js'));

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
        winston.error("Adding log failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });

};

function addLog(user_id, user_ip, action, details){
    DBModel.create({
        user_id: user_id,
        user_ip: user_ip,
        action: action,
        details: details
    }).then(function(result) {
        return null;
    }).catch(function(err) {
        winston.error("Saving log failed with error: ", err);
        return null;
    });
}

/**
 * Show current
 */
exports.read = function(req, res) {
    res.json(req.logs);
};

/**
 * Update
 */
exports.update = function(req, res) {
    var updateData = req.logs;

    updateData.updateAttributes(req.body).then(function(result) {

        return res.jsonp(result);
        res.json(result);
    }).catch(function(err) {
        winston.error("Updating log failed with error: ", err);
        res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
        return null;
    });
};

/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.logs;

    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {
            result.destroy().then(function() {
                return res.json(result);
            }).catch(function(err) {
                winston.error("Deleting log failed with error: ", err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        } else {
            return res.status(400).send({
                message: 'Unable to find the Data'
            });
        }
        return null;
    }).catch(function(err) {
        winston.error("Finding log failed with error: ", err);
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
    if(query._orderBy) final_where.order = [[query._orderBy, query._orderDir]];
    final_where.include = [{model: db.models.users, required: true, attributes: ['username']}];
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
        winston.error("Getting log list failed with error: ", err);
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
        include: [{model: db.models.users, required: true, attributes: ['username']}]
    }).then(function(result) {
        if (!result) {
            res.status(404).send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.logs = result;
            next();
            return null;
        }
    }).catch(function(err) {
        winston.error("Getting log failed with error: ", err);
        next(err);
        return null;
    });

};

exports.add_log = addLog;
