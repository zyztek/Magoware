'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    Sequelize = require('sequelize'),
    response = require(path.resolve("./config/responses.js")),
    winston = require(path.resolve('./config/lib/winston')),
    dateFormat = require('dateformat'),
    async = require('async'),
    schedule = require(path.resolve("./modules/deviceapiv2/server/controllers/schedule.server.controller.js")),
    akamai_token_generator = require(path.resolve('./modules/streams/server/controllers/akamai_token_v2')),
    models = db.models;

/**
 * @api {post} /apiv2/channels/catchup_events /apiv2/channels/catchup_events
 * @apiVersion 0.2.0
 * @apiName CatchupEvents
 * @apiGroup DeviceAPI
 * @apiParam {String} auth Encrypted authentication token string.
 * @apiDescription Returns list of epg data for the given channel, in a specific day
 * @apiSuccessExample Success-Response:
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1,
 *       "error_description": "OK",
 *       "extra_data": "OK_DATA",
 *       "response_object": [
 *          {
 *              "channelName": "Channel name",
 *              "id": 206778,
 *              "number": 100,
 *              "title": "Event title",
 *              "scheduled": false, // [true, false]
 *              "description": "Event description",
 *              "shortname": "Event short name",
 *              "programstart": "05/24/2018 23:55:00",
 *              "programend": "05/25/2018 00:40:00",
 *              "duration": 2700, //in seconds
 *              "progress": 10 //for current events in [1-100]
 *          }, ....
 *       ]
 *     }
 * @apiErrorExample Error-Response:
 *     {
 *       "status_code": 704,
 *       "error_code": -1,
 *       "timestamp": 1,
 *       "error_description": "DATABASE_ERROR",
 *       "extra_data": "Error connecting to database",
 *       "response_object": []
 *     }
 *
 *
 */
exports.catchup_events =  function(req, res) {
    var client_timezone = req.body.device_timezone; //offset of the client will be added to time - related info
    var client_time = 24-parseInt(client_timezone);
    var current_human_time = dateFormat(Date.now()  + (req.body.day - 1)*3600000*24, "yyyy-mm-dd "+client_time+":00:00"); //start of the day for the user, in server time
    var interval_end_human = dateFormat((Date.now() + req.body.day*3600000*24), "yyyy-mm-dd "+client_time+":00:00"); //end of the day for the user, in server time

    models.epg_data.findAll({
        attributes: [ 'id', 'title', 'short_description', 'short_name', 'duration_seconds', 'program_start', 'program_end', 'long_description' ],
        order: [['program_start', 'ASC']],
        include: [
            {
                model: models.channels, required: true, attributes: ['title', 'channel_number'],
                where: {channel_number: req.body.channelNumber} //limit data only for this channel
            },
            {model: models.program_schedule,
                required: false, //left join
                attributes: ['id'],
                where: {login_id: req.thisuser.id}
            }
        ],
        where: {program_start: {lte: interval_end_human}, program_end: {gte: current_human_time}}
    }).then(function (result) {
        //todo: what if channel number is invalid and it finds no title???
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};
            Object.keys(obj.toJSON()).forEach(function(k) {
                if (typeof obj[k] == 'object') {
                    Object.keys(obj[k]).forEach(function(j) {
                        var programstart = parseInt(obj.program_start.getTime()) +  parseInt((client_timezone) * 3600000);
                        var programend = parseInt(obj.program_end.getTime()) +  parseInt((client_timezone) * 3600000);
                        raw_obj.channelName = obj[k].title;
                        raw_obj.id = obj.id;
                        raw_obj.number = obj[k].channel_number;
                        raw_obj.title = obj.title;
                        raw_obj.scheduled = (!obj.program_schedules[0]) ? false : schedule.is_scheduled(obj.program_schedules[0].id); //if there is an event in the local memory, return true
                        raw_obj.description = obj.long_description;
                        raw_obj.shortname = obj.short_description;
                        raw_obj.programstart = dateFormat(programstart, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                        raw_obj.programend = dateFormat(programend, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                        raw_obj.duration = obj.duration_seconds;
                        raw_obj.progress = Math.round((Date.now() - obj.program_start.getTime() ) * 100 / (obj.program_end.getTime() - obj.program_start.getTime()));
                    });
                }
            });
            raw_result.push(raw_obj);
        });
        response.send_res(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=43200');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};


// returns list of epg data for the given channel - GET METHOD
exports.get_catchup_events =  function(req, res) {
    var client_timezone = req.query.device_timezone; //offset of the client will be added to time - related info
    var client_time = 24-parseInt(client_timezone);
    var current_human_time = dateFormat(Date.now()  + (req.query.day - 1)*3600000*24, "yyyy-mm-dd "+client_time+":00:00"); //start of the day for the user, in server time
    var interval_end_human = dateFormat((Date.now() + req.query.day*3600000*24), "yyyy-mm-dd "+client_time+":00:00"); //end of the day for the user, in server time

    models.epg_data.findAll({
        attributes: [ 'id', 'title', 'short_description', 'short_name', 'duration_seconds', 'program_start', 'program_end', 'long_description' ],
        order: [['program_start', 'ASC']],
        include: [
            {
                model: models.channels, required: true, attributes: ['title', 'channel_number'],
                where: {channel_number: req.query.channelNumber} //limit data only for this channel
            },
            {model: models.program_schedule,
                required: false, //left join
                attributes: ['id'],
                where: {login_id: req.thisuser.id}
            }
        ],
        where: {program_start: {lte: interval_end_human}, program_end: {gte: current_human_time}}
    }).then(function (result) {
        //todo: what if channel number is invalid and it finds no title???
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};
            Object.keys(obj.toJSON()).forEach(function(k) {
                if (typeof obj[k] == 'object') {
                    Object.keys(obj[k]).forEach(function(j) {
                        var programstart = parseInt(obj.program_start.getTime()) +  parseInt((client_timezone) * 3600000);
                        var programend = parseInt(obj.program_end.getTime()) +  parseInt((client_timezone) * 3600000);
                        raw_obj.channelName = obj[k].title;
                        raw_obj.id = obj.id;
                        raw_obj.number = obj[k].channel_number;
                        raw_obj.title = obj.title;
                        raw_obj.scheduled = (!obj.program_schedules[0]) ? false : schedule.is_scheduled(obj.program_schedules[0].id); //if there is an event in the local memory, return true
                        raw_obj.description = obj.long_description;
                        raw_obj.shortname = obj.short_description;
                        raw_obj.programstart = dateFormat(programstart, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                        raw_obj.programend = dateFormat(programend, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                        raw_obj.duration = obj.duration_seconds;
                        raw_obj.progress = Math.round((Date.now() - obj.program_start.getTime() ) * 100 / (obj.program_end.getTime() - obj.program_start.getTime()));
                    });
                }
            });
            raw_result.push(raw_obj);
        });
        response.send_res_get(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=43200');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};


/**
 * @api {post} /apiv2/channels/catchup_stream Get Channels Catchup Stream
 * @apiName CatchupEvents
 * @apiGroup Catchup
 * @apiParam {String} auth Encrypted authentication token string.
 * @apiParam {Number} channelNumber Channel number
 * @apiParam {Number} timestart Unix timestamp where te stream should start.
 * @apiDescription Returns catchup stream url for the requested channel.
 *
 */


exports.catchup_stream =  function(req, res) {
    var channel_number = req.body.channelNumber;
    var stream_mode = 'catchup';
    var stream_resolution = (req.auth_obj.screensize === 1) ? {like: '%large%'} : {like: '%small%'}; //filter streams based on device resolution

    models.channels.findOne({
        attributes: ['id'],
        include: [{model: models.channel_stream, required: true,  where: {stream_source_id: req.thisuser.channel_stream_source_id, stream_mode: stream_mode, stream_resolution: stream_resolution}}],
        where: {channel_number: channel_number}
    }).then(function (catchup_streams) {

        //if timestamp is missing milisecconds
        if(req.body.timestart.toString().length == 10) {
            req.body.timestart = req.body.timestart * 1000;
        }

        var thestream = catchup_streams.channel_streams[0].stream_url;

        //check recording engine
        if(catchup_streams.channel_streams[0].recording_engine == 'wowza') {
            var date = new Date(req.body.timestart);
            var catchup_moment = date.getFullYear() + (("0" + date.getMonth()).slice(-2)) + (("0" + date.getDay()).slice(-2)) + (("0" + date.getHours()).slice(-2)) + (("0" + date.getMinutes()).slice(-2)) + (("0" + date.getSeconds()).slice(-2));
            thestream = thestream.replace('[epochtime]', catchup_moment);
        }
        else {  //assume it is flussonic

            //if timestamp is bigger than 2.5 ours
            if((Date.now()/1000 - req.body.timestart) > 9000) {
                thestream = thestream.replace('timeshift_abs','index');
                thestream = thestream.replace('[epochtime]',req.body.timestart + '-9000');
            }
            else {
                thestream = thestream.replace('[epochtime]', req.body.timestart);
            }
        }

        var response_data = [{
            "streamurl": thestream, //catchup_streams.channel_streams[0].stream_url.replace('[epochtime]', req.body.timestart)
            "stream_format":  catchup_streams.channel_streams[0].stream_format,
            "token":  catchup_streams.channel_streams[0].token,
            "token_url":  catchup_streams.channel_streams[0].token_url,
            "encryption":  catchup_streams.channel_streams[0].encryption,
            "encryption_url":  catchup_streams.channel_streams[0].encryption_url
        }];

        response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');

    }).catch(function(error) {
        winston.error('error catchup_stream',error);
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};