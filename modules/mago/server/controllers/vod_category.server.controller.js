'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    fileHandler = require(path.resolve('./modules/mago/server/controllers/common.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.vod_category,
    refresh = require(path.resolve('./modules/mago/server/controllers/common.controller.js')),
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
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * Show current
 */
exports.read = function(req, res) {
    res.json(req.vodCategory);
};

/**
 * Update
 */
exports.update = function(req, res) {
    var updateData = req.vodCategory;
    if(updateData.icon_url != req.body.icon_url) {
        var deletefile = path.resolve('./public'+updateData.icon_url);
    }
    if(updateData.small_icon_url != req.body.small_icon_url) {
        var deletesmallfile = path.resolve('./public'+updateData.small_icon_url);
    }

    updateData.updateAttributes(req.body).then(function(result) {
        if(deletefile) {
            fs.unlink(deletefile, function (err) {
                //todo: display some warning
            });
        }
        if(deletesmallfile) {
            fs.unlink(deletesmallfile, function (err) {
                //todo: display some warning
            });
        }
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
    var deleteData = req.vodCategory;
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
        qwhere.$or.name = {};
        qwhere.$or.name.$like = '%'+query.q+'%';
        qwhere.$or.description = {};
        qwhere.$or.description.$like = '%'+query.q+'%';
    }

    //start building where
    final_where.where = qwhere;
    if(parseInt(query._end) !== -1){
        if(parseInt(query._start)) final_where.offset = parseInt(query._start);
        if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
    }
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
            req.vodCategory = result;
            next();
            return null;
        }
    }).catch(function(err) {
        return next(err);
    });

};
