'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.vod,
    refresh = require(path.resolve('./modules/mago/server/controllers/common.controller.js')),
    request = require("request"),
    fs = require('fs');

/**
 * Create
 */
exports.create = function(req, res) {
    DBModel.create(req.body).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail create data'});
        } else {
            logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));
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
    res.json(req.vod);
};

/**
 * Update
 */
exports.update = function(req, res) {

    var updateData = req.vod;
    if(updateData.icon_url != req.body.icon_url) {
        var deletefile = path.resolve('./public'+updateData.icon_url);
    }
    if(updateData.image_url != req.body.image_url) {
        var deleteimage = path.resolve('./public'+updateData.image_url);
    }

    updateData.updateAttributes(req.body).then(function(result) {
        if(deletefile) {
            fs.unlink(deletefile, function (err) {
                //todo: return some warning
            });
        }
        if(deleteimage) {
            fs.unlink(deleteimage, function (err) {
                //todo: return some warning
            });
        }
        logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));
        return res.json(result);
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
    var deleteData = req.vod;
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

exports.list = function(req, res) {
    var qwhere = {},
        final_where = {},
        query = req.query;

    if(query.q) {
        qwhere.$or = {};
        qwhere.$or.title = {};
        qwhere.$or.title.$like = '%'+query.q+'%';
        qwhere.$or.description = {};
        qwhere.$or.description.$like = '%'+query.q+'%';
        qwhere.$or.director = {};
        qwhere.$or.director.$like = '%'+query.q+'%';
    }
    if(query.title) qwhere.title = {like: '%'+query.title+'%'};
    if(query.category) qwhere.category_id = query.category;

    //filter films added in the following time interval
    if(query.added_before && query.added_after) qwhere.createdAt = {lt: query.added_before, gt: query.added_after};
    else if(query.added_before) qwhere.createdAt = {lt: query.added_before};
    else if(query.added_after) qwhere.createdAt = {gt: query.added_after};
    //filter films updated in the following time interval
    if(query.updated_before && query.updated_after) qwhere.createdAt = {lt: query.updated_before, gt: query.updated_after};
    else if(query.updated_before) qwhere.createdAt = {lt: query.updated_before};
    else if(query.updated_after) qwhere.createdAt = {gt: query.updated_after};

    //start building where
    final_where.where = qwhere;
    if(parseInt(query._end) !== -1){
        if(parseInt(query._start)) final_where.offset = parseInt(query._start);
        if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
    }
    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
    final_where.include = [db.vod_category, db.package];
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
        include: [{model: db.vod_category}, {model: db.package},{model: db.vod_subtitles},{model: db.vod_stream}]
    }).then(function(result) {
        if (!result) {
            return res.status(404).send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.vod = result;
            next();
            return null;
        }
    }).catch(function(err) {
        return next(err);
    });

};

//todo: document api
//todo: revise these params
exports.update_film = function(req, res) {
    omdbapi(req.body.imdb_id, req.body.title, req.body.year, function(response_omdbapi){
        DBModel.update(
            {
                title: response_omdbapi.title,
                description: response_omdbapi.description,
                year: response_omdbapi.year,
                rate: response_omdbapi.rate,
                duration: response_omdbapi.duration,
                director: response_omdbapi.director,
                starring: response_omdbapi.starring,
                pin_protected: response_omdbapi.pin_protected
            },
            {where: {id: req.params.vodId}}
        ).then(function(result){

        }).catch(function(error){
            console.log(error)
        });
        res.send(response_omdbapi);
    });

};

function omdbapi(imdb_id, title, year, callback){
    var search_params = "";
    if(imdb_id) search_params = search_params+'i='+imdb_id;
    else if(title){
        search_params = search_params+'t='+title;
        if(year) search_params = search_params+'&y='+year;
    }

    var options = {
        url: 'http://www.omdbapi.com/?'+search_params+'&apikey=a421091c',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    request(options, function (error, response, body) {
        //todo: if response dhe response parsable as JSON
        JSON.parse(response.body);

        var vod_data = {
            title: JSON.parse(response.body).Title,
            description: JSON.parse(response.body).Plot,
            year: JSON.parse(response.body).Year,
            image: JSON.parse(response.body).Poster,
            rate: JSON.parse(response.body).imdbRating,
            duration: JSON.parse(response.body).Runtime.replace(' min', ''),
            director: JSON.parse(response.body).Director,
            starring: JSON.parse(response.body).Actors,
            pin_protected: (['R', 'X', 'PG-13'].indexOf(JSON.parse(response.body).Rated) !== -1) ? 1 : 0
        };
        callback(vod_data);
    });
}