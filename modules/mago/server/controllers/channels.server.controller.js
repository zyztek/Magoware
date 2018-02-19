'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    refresh = require(path.resolve('./modules/mago/server/controllers/common.controller.js')),
    DBModel = db.channels,
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
            message: 'Check if this channel number is available'//errorHandler.getErrorMessage(err)
        });
    });




};

/**
 * Show current
 */
exports.read = function(req, res) {
    res.json(req.channels);
};

/**
 * @api {put} /api/channels/:channelId Channels - Update channel data
 * @apiVersion 0.2.0
 * @apiName update_channel
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {Number} genre_id  Optional field start_date.
 * @apiParam {String} channel_number  Optional field channel_number.
 * @apiParam {String} title  Optional field title.
 * @apiParam {String} description  Optional field description.
 * @apiParam {String} icon_url  Optional field icon_url.
 * @apiParam {Boolean} pin_protected  Optional field pin_protected.
 * @apiParam {Boolean} isavailable  Optional field isavailable.
 * @apiSuccess (200) {String} message Json of updated record
 * @apiError (40x) {Text} message {
 * "message": informing_message
 * }
 */
exports.update = function(req, res) {
    var updateData = req.channels;
    if(updateData.icon_url != req.body.icon_url) {
        var deletefile = path.resolve('./public'+updateData.icon_url);
    }

    updateData.updateAttributes(req.body).then(function(result) {
        logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));
        if(deletefile) {
            fs.unlink(deletefile, function (err) {
                //todo: return some response?
            });
        }
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
    var deleteData = req.channels;

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
        return null;
    }).catch(function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });

};

/**
 * @api {get} /api/channels Channels - list
 * @apiVersion 0.2.0
 * @apiName List channels
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {Number} _end  Optional query parameter _end.
 * @apiParam {String} _start  Optional query parameter _start.
 * @apiParam {String} _orderBy  Optional query parameter _orderBy.
 * @apiParam {String} genre_id  Optional query parameter genre_id.
 *
 *  * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *          {
 *              "id": 100,
 *              "genre_id": 1,
 *              "package_id": null,
 *              "channel_number": 200,
 *              "title": "channel title",
 *              "description": "channel description",
 *              "icon_url": "icon url",
 *              "pin_protected": false, // true / false
 *              "isavailable": true, // true / false
 *              "createdAt": null,
 *              "updatedAt": "yyyy-mm-ddThh:mm:ss.000Z",
 *              "genre": {
 *                  "id": 1,
 *                  "description": "genre description",
 *                  "is_available": true, // true / false
 *                  "icon_url": "icon url",
 *                  "createdAt": null,
 *                  "updatedAt": "yyyy-mm-ddThh:mm:ss.000Z"
 *              },
 *              "packages_channels": [
 *                  {
 *                      "package_id": 92
 *                  },....
 *              ]
 *          }...
 *     ]
 */
exports.list = function(req, res) {

    var qwhere = {},
        final_where = {},
        query = req.query;

    if(query.q) {
        qwhere.$or = {};
        qwhere.$or.title = {};
        qwhere.$or.title.$like = '%'+query.q+'%';
        qwhere.$or.channel_number = {};
        qwhere.$or.channel_number.$like = '%'+query.q+'%';
    }

    //start building where
    final_where.where = qwhere;
    if(parseInt(query._end) !== -1){
        if(parseInt(query._start)) final_where.offset = parseInt(query._start);
        if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
    }
    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
    else final_where.order = [['channel_number', 'ASC']];

    if (query.genre_id) qwhere.genre_id = query.genre_id;

    DBModel.count(final_where).then(function(totalrecord) {

        final_where.include = [{model:db.genre,required:true},{model:db.packages_channels,attributes: ['package_id']}];

        DBModel.findAll(
            final_where
        ).then(function(results) {
            if (!results) {
                return res.status(404).send({
                    message: 'No data found'
                });
            } else {
                res.setHeader("X-Total-Count", totalrecord);
                res.json(results);
            }
        }).catch(function(err) {
            res.jsonp(err);
        });
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
        include: [{model: db.genre}, {model: db.packages_channels}]
    }).then(function(result) {
        if (!result) {
            return res.status(404).send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.channels = result;
            next();
            return null;
        }
    }).catch(function(err) {
        return next(err);
    });

};