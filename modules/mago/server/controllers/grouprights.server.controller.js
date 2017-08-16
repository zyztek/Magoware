'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.grouprights;

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
    res.json(req.users);
};

/**
 * Update
 */
exports.update = function(req, res) {
    //var updateData = req.users;

    DBModel.findOne(
        {
            where: {
                group_id: req.body.group_id,
                api_group_id: req.body.api_group_id
            }
        }
    ).then(function(result){
        if(result) {
            result.update(req.body)
                .then(function(result) {
                    res.json({message: 'update success'});
                });
        }
        else {
            DBModel.create(req.body)
                .then(function(result) {
                    res.json({message: 'Create success'});
                });
        }
        return null;
        //res.send(result);
    }).catch(function(err) {
        return res.status(404).send({
            message: 'Error'
        });
    });


};

/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.users;

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

    db.api_group.findAndCountAll({
        attributes: ['id', 'api_group_name', 'description'],
        include: [{model:db.grouprights, where: { group_id: req.query.group_id },required: false, attributes: ['group_id', 'read','edit','create']}],
        order: ['api_group.id'],
        raw: true
    }).then(function(results) {
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
            req.users = result;
            next();
            return null;
        }
    }).catch(function(err) {
        return next(err);
    });

};