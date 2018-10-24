'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    fileHandler = require(path.resolve('./modules/mago/server/controllers/common.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.device_menu_level2,
    refresh = require(path.resolve('./modules/mago/server/controllers/common.controller.js')),
    fs = require('fs');

/**
 * Create
 */
exports.create = function(req, res) {

    req.body.appid = req.body.appid.toString();

    DBModel.create(req.body).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail create data'});
        } else {
            return res.jsonp(result);
        }
    }).catch(function(err) {
        if(err.name === "SequelizeUniqueConstraintError"){
            if(err.errors[0].path === "position")  return res.status(400).send({message: 'This position is being used by another menu'}); //position is taken
            else return res.status(400).send({message: err.errors[0].message}); //other duplicate fields. return sequelize error message
        }
        else {
            return res.status(400).send({message: 'An error occurred while creating menu item. '+err.errors[0].message}); //another error occurred. return sequelize error message
        }
    });
};


/**
 * Show current
 */

exports.read = function(req, res) {
    res.json(req.devicemenulevel2);
};



/**
 * Update
 */
exports.update = function(req, res) {

    var updateData = req.devicemenulevel2;
    if(updateData.icon_url != req.body.icon_url) {
        var deletefile = path.resolve('./public'+updateData.icon_url);
    }
    req.body.appid = req.body.appid.toString();

    updateData.updateAttributes(req.body).then(function(result){
        if(deletefile) {
            fs.unlink(deletefile, function (err) {
                //todo: do sth on error?
            });
        }
        res.json(result);
    }).catch(function(err) {
        if(err.name === "SequelizeUniqueConstraintError"){
            if(err.errors[0].path === "position")  return res.status(400).send({message: 'This position is being used by another menu'}); //position is taken
            else return res.status(400).send({message: err.errors[0].message}); //other duplicate fields. return sequelize error message
        }
        else {
            return res.status(400).send({message: 'An error occurred while editing menu item. '+err.errors[0].message}); //another error occurred. return sequelize error message
        }
    });

};

/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.devicemenulevel2;

    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {
            result.destroy().then(function() {
                return res.json(result);
            }).catch(function(err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            });
            return null;
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
            req.devicemenulevel2 = result;
            req.devicemenulevel2.appid = JSON.parse("[" + req.devicemenulevel2.appid + "]");
            next();
            return null;
        }
    }).catch(function(err) {
        return next(err);
    });

};
