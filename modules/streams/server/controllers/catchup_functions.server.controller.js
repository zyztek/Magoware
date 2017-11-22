'use strict'
var path = require('path'),
    response = require(path.resolve("./config/responses.js")),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')),
    models = db.models;
const querystring = require('querystring');


/**
 * @api {post} /apiv2/catchup/flussonic /apiv2/catchup/flussonic
 * @apiVersion 0.2.0
 * @apiName Catchup Flussonic
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns catchup stream URL to be played on the frontend player.
 */

exports.flussonic_catchup_stream = function(req,res) {

    var channel_number = (req.body.channel_number) ? req.body.channel_number : 0;

    models.channels.findAll({
        attributes : [],
        include: [
            {model: models.channel_stream, required: true, attributes: ['stream_url'],where:{stream_mode:'catchup'}}
        ],
        where: {channel_number: channel_number}
    }).then(function (result) {
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        var response_object = {};
        response_object.streamurl = result[0].channel_streams[0].stream_url.replace('[timestamp]',req.body.timestamp).replace('[duration]',req.app.locals.settings.activity_timeout);

        //if query parameters not empty
        if(Object.keys(req.query).length > 0) {
            response_object.streamurl += "?"+querystring.stringify(req.query);
        }

        clear_response.response_object[0] = response_object;

        res.send(clear_response);

    }).catch(function(error) {
        console.log(error);
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });
};