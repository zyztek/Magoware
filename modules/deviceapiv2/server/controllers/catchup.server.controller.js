'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    Sequelize = require('sequelize'),
    response = require(path.resolve("./config/responses.js")),
    winston = require(path.resolve('./config/lib/winston')),
    dateFormat = require('dateformat'),
    async = require('async'),
    schedule = require(path.resolve("./modules/deviceapiv2/server/controllers/schedule.server.controller.js")),
    models = db.models;

// returns list of epg data for the given channel
exports.catchup_events =  function(req, res) {
    var client_timezone = req.body.device_timezone; //offset of the client will be added to time - related info
    var current_human_time = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss"); //get current time to compare with enddate
    var interval_end_human = dateFormat((Date.now() + 86400000), "yyyy-mm-dd HH:MM:ss"); //get current time to compare with enddate, in the interval of 12 hours

    models.epg_data.findAll({
        attributes: [ 'id', 'title', 'short_description', 'short_name', 'duration_seconds', 'program_start', 'program_end' ],
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
        where: Sequelize.and(
            {program_start: {lte: interval_end_human}},
            Sequelize.or(
                Sequelize.and(
                    {program_start:{lte:current_human_time}},
                    {program_end:{gte:current_human_time}}
                ),
                Sequelize.and(
                    {program_start: {gte:current_human_time}},
                    {program_end:{lte:interval_end_human}}
                )
            )
        )
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
                        raw_obj.description = obj.short_description;
                        raw_obj.shortname = obj.short_name;
                        raw_obj.programstart = dateFormat(programstart, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                        raw_obj.programend = dateFormat(programend, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                        raw_obj.duration = obj.duration_seconds;
                        raw_obj.progress = Math.round((Date.now() - obj.program_start.getTime() ) * 100 / (obj.program_end.getTime() - obj.program_start.getTime()));
                    });
                }
            });
            raw_result.push(raw_obj);
        });

        var okresponse = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        okresponse.response_object = raw_result;
        res.send(okresponse);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);

    });

};

exports.catchup_stream =  function(req, res) {
    //console.log('incoming reques castchup stream')

    var channel_number;
    if(req.body.channelNumber)
        channel_number = req.body.channelNumber
    else
        channel_number = req.body.channel_number;


    models.channels.findOne({
        attributes: ['id'],
        include: [{model: models.channel_stream, required: true, attributes: ['stream_url', 'stream_format'], where: {stream_source_id: req.thisuser.channel_stream_source_id, stream_mode: 'catchup'}}],
        where: {channel_number: channel_number}
    }).then(function (catchup_streams) {
        var okresponse = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        //catchup stream format for hls streams
        okresponse.response_object = [{
            "streamurl": catchup_streams.channel_streams[0].stream_url.replace('[epochtime]', req.body.timestart)
        }];
        res.send(okresponse);
    }).catch(function(error) {
        console.log(error);
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });

};