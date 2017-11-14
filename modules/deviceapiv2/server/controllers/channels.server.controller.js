'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    Sequelize = require('sequelize'),
    db_funct = require(path.resolve("./custom_functions/sequelize_functions.js")),
    response = require(path.resolve("./config/responses.js")),
    winston = require(path.resolve('./config/lib/winston')),
    dateFormat = require('dateformat'),
    moment = require('moment'),
    async = require('async'),
    schedule = require(path.resolve("./modules/deviceapiv2/server/controllers/schedule.server.controller.js")),
    models = db.models;

exports.list = function(req, res) {
    var qwhere = {};
    qwhere.isavailable = true;
    if(req.thisuser.show_adult == 0) qwhere.pin_protected = 0; //show adults filter
    else qwhere.pin_protected != ''; //avoid adult filter

    // requisites for streams provided by the user
    var userstream_qwhere = {"isavailable": true, "login_id": req.thisuser.id};

    // requisites for streams served by the company
    var stream_qwhere = {};
    if(req.thisuser.player.toUpperCase() === 'default'.toUpperCase()) stream_qwhere.stream_format = {$not: 0}; //don't send mpd streams for default player
    if(req.auth_obj.appid === 3) stream_qwhere.stream_format = 2; // send only hls streams for ios application
    stream_qwhere.stream_source_id = req.thisuser.channel_stream_source_id; // streams come from the user's stream source
    stream_qwhere.stream_mode = 'live';

    // requisites for catchup streams
    var catchupstream_where = {stream_source_id: req.thisuser.channel_stream_source_id, stream_mode: 'catchup'};
    if(req.thisuser.player.toUpperCase() === 'default'.toUpperCase()) catchupstream_where.stream_format = {$not: 0}; //don't send mpd streams for default player
    if(req.auth_obj.appid === 3) catchupstream_where.stream_format = 2; // send only hls streams for ios application

//find user channels and subscription channels for the user
    models.my_channels.findAll({
        attributes: ['id', 'channel_number', 'genre_id', 'title', 'description', 'stream_url'],
        where: userstream_qwhere,
        include: [{ model: models.genre, required: true, attributes: ['icon_url'], where: {is_available: true} }],
        order: [[ 'channel_number', 'ASC' ]],
        raw: true
    }).then(function (my_channel_list) {
        models.channel_stream.findAll({
            attributes: ['channel_id'],
            where: catchupstream_where
        }).then(function (catchup_streams) {
            models.channels.findAll({
                raw:true,
                attributes: ['id','genre_id', 'channel_number', 'title', 'icon_url','pin_protected'],
                group: ['id'],
                where: qwhere,
                include: [
                    {model: models.channel_stream,
                        required: true,
                        attributes: ['stream_source_id','stream_url','stream_format','token','token_url','is_octoshape','encryption','encryption_url'],
                        where: stream_qwhere
                    },
                    { model: models.genre, required: true, attributes: [], where: {is_available: true} },
                    {model: models.packages_channels,
                        required: true,
                        attributes:[],
                        include:[
                            {model: models.package,
                                required: true,
                                attributes: [],
                                where: {package_type_id: req.auth_obj.screensize},
                                include:[
                                    {model: models.subscription,
                                        required: true,
                                        attributes: [],
                                        where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                                    }
                                ]}
                        ]},
                    {model: models.favorite_channels,
                        required: false, //left join
                        attributes: ['id'],
                        where: {user_id: req.thisuser.id}
                    }
                ],
                order: [[ 'channel_number', 'ASC' ]]
            }).then(function (result) {
                var user_channel_list = [];

                for (var i = 0; i < my_channel_list.length; i++) {
                    var temp_obj = {};
                    temp_obj.id = my_channel_list[i].id;
                    temp_obj.channel_number = my_channel_list[i].channel_number;
                    temp_obj.title = my_channel_list[i].title;
                    temp_obj.icon_url = req.app.locals.settings.assets_url + my_channel_list[i]["genre.icon_url"];
                    temp_obj.stream_url = my_channel_list[i]["stream_url"];
                    temp_obj.genre_id = my_channel_list[i].genre_id;
                    temp_obj.channel_mode = 'live';
                    temp_obj.pin_protected = 'false';
                    temp_obj.stream_source_id = 1;
                    temp_obj.stream_format = "1";
                    temp_obj.token = 0;
                    temp_obj.token_url = 'http://tibomanager4.tibo.tv/unsecured/token/apiv2/Akamai_token.aspx';
                    temp_obj.encryption = 0;
                    temp_obj.encryption_url = "0";
                    temp_obj.is_octoshape = 0;
                    temp_obj.favorite_channel = "0";
                    user_channel_list.push(temp_obj)
                }

                for (var i = 0; i < result.length; i++) {
                    result[i].icon_url = req.app.locals.settings.assets_url + result[i]["icon_url"];
                    result[i].pin_protected = result[i].pin_protected == 0 ? 'false':'true';
                    result[i].stream_source_id = result[i]["channel_streams.stream_source_id"]; delete result[i]["channel_streams.stream_source_id"];
                    result[i].stream_url = result[i]["channel_streams.stream_url"]; delete result[i]["channel_streams.stream_url"];
                    result[i].channel_mode = has_catchup(catchup_streams, result[i]["id"]);
                    result[i].stream_format = result[i]["channel_streams.stream_format"]; delete result[i]["channel_streams.stream_format"];
                    result[i].token = result[i]["channel_streams.token"]; delete result[i]["channel_streams.token"];
                    result[i].token_url = result[i]["channel_streams.token_url"]; delete result[i]["channel_streams.token_url"];
                    result[i].encryption = result[i]["channel_streams.encryption"]; delete result[i]["channel_streams.encryption"];
                    result[i].encryption_url = result[i]["channel_streams.encryption_url"]; delete result[i]["channel_streams.encryption_url"];
                    result[i].is_octoshape = result[i]["channel_streams.is_octoshape"]; delete result[i]["channel_streams.is_octoshape"];
                    result[i].favorite_channel = result[i]["favorite_channels.id"] ? "1":"0"; delete result[i]["favorite_channels.id"];
                }

                var response_data = result.concat(user_channel_list);
                response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
            return null;
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

// returns list of genres for live tv, including a static favorite
exports.genre = function(req, res) {
    models.genre.findAll({
        attributes: ['id',['description', 'name']],
        where: {is_available: true}
    }).then(function (result) {
        var favorite_genre = {
            "id": 666,
            "name": "Favorites"
        };
        var response_data = result.concat(favorite_genre);
        response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

// returns list of all epg data
exports.epg = function(req, res) {
    var client_timezone = req.body.device_timezone;
    //request parameters: list of channel numbers for the epg, timeshift
    var channel_number = req.body.number.toString().split(',');
    var timeshift = req.body.timeshift;

    var starttime = dateFormat((Date.now() + (parseInt(timeshift) + 2) * 3600000), "yyyy-mm-dd HH:MM:ss");
    var endtime   = dateFormat((Date.now() + (parseInt(timeshift) - 2) * 3600000), "yyyy-mm-dd HH:MM:ss");

    //gets epg of the channels from the list for the next 4 hours starting from timeshift
    models.epg_data.findAll({
        attributes: [ 'id', 'title', 'short_description', 'short_name', 'duration_seconds', 'program_start', 'program_end' ],
        include: [
            {
                model: models.channels, required: true, attributes: ['title', 'channel_number'],
                where: {channel_number: {in: channel_number}} //limit data only for this list of channels
            },
            {model: models.program_schedule,
                required: false, //left join
                attributes: ['id'],	where: {login_id: req.thisuser.id}
            }
        ],
        where: Sequelize.and(
            Sequelize.or(
                {program_start:{between:[starttime, endtime]}},
                {program_end: {between:[starttime, endtime]}},
                Sequelize.and(
                    {program_start: {lte:starttime}},
                    {program_end:{gte:endtime}}
                )
            )
        )
    }).then(function (result) {
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};
            Object.keys(obj.toJSON()).forEach(function(k) {
                if (typeof obj[k] == 'object') {
                    Object.keys(obj[k]).forEach(function(j) {
                        if(j === 'dataValues'){
                            var programstart = parseInt(obj.program_start.getTime()) +  parseInt(client_timezone * 3600000);
                            var programend = parseInt(obj.program_end.getTime()) +  parseInt(client_timezone * 3600000);

                            raw_obj.channelName = obj[k].title;
                            raw_obj.number = obj[k].channel_number;
                            raw_obj.id = obj.id;
                            raw_obj.scheduled = (!obj.program_schedules[0]) ? false : schedule.is_scheduled(obj.program_schedules[0].id);
                            raw_obj.title = obj.title;
                            raw_obj.description = obj.short_description;
                            raw_obj.shortname = obj.short_name;
                            raw_obj.programstart = dateFormat(programstart, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                            raw_obj.programend = dateFormat(programend, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                            raw_obj.duration = obj.duration_seconds;
                        }
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

// returns list of epg data for the given channel
exports.event =  function(req, res) {
    var client_timezone = req.body.device_timezone; //offset of the client will be added to time - related info
    var current_human_time = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss"); //get current time to compare with enddate
    var interval_end_human = dateFormat((Date.now() + 43200000), "yyyy-mm-dd HH:MM:ss"); //get current time to compare with enddate, in the interval of 12 hours
    var channel_title = '';

    models.channels.findOne({
        attributes: ['title'],
        where: {channel_number: req.body.channelNumber}
    }).then(function (thischannel) {
        if(thischannel) channel_title = thischannel.title;
        models.my_channels.findOne({
            attributes: ['title'],
            where: {channel_number: req.body.channelNumber}
        }).then(function (user_channel) {
            if(user_channel) channel_title = user_channel.title;
            models.epg_data.findAll({
                attributes: [ 'id', 'title', 'short_description', 'short_name', 'duration_seconds', 'program_start', 'program_end' ],
                order: [['program_start', 'ASC']],
                limit: 3,
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
                var raw_result = [];
                var default_programs = [];
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
                                raw_obj.scheduled = (!obj.program_schedules[0]) ? false : schedule.is_scheduled(obj.program_schedules[0].id);
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

                if(result.length <3){
                    for(var i=0; i<3-result.length; i++){
                        var temp_obj = {};
                        temp_obj.channelName = channel_title;
                        temp_obj.id = -1;
                        temp_obj.number = req.body.channelNumber;
                        temp_obj.title = "Program of "+channel_title;
                        temp_obj.scheduled = false;
                        temp_obj.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
                        temp_obj.shortname = "Program of "+channel_title;
                        temp_obj.programstart = '01/01/1970 00:00:00';
                        temp_obj.programend = '01/01/1970 00:00:00';
                        temp_obj.duration = 0;
                        temp_obj.progress = 0;
                        raw_result.push(temp_obj);
                    }
                }
                response.send_res(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=43200');
            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
            return null;
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

// returns list of epg data for the given channel
exports.daily_epg =  function(req, res) {
    var client_timezone = req.body.device_timezone; //offset of the client will be added to time - related info
    var interval_start = dateFormat(Date.now() - client_timezone*3600 + req.body.day*3600000*24, "yyyy-mm-dd 00:00:00"); //start of the day for the user, in server time
    var interval_end = dateFormat((Date.now() - client_timezone*3600 + req.body.day*3600000*24), "yyyy-mm-dd 23:59:59"); //end of the day for the user, in server time

    async.auto({
        get_channel: function(callback) {
            models.channels.findOne({
                attributes: ['title'],
                where: {channel_number: req.body.channel_number}
            }).then(function (channel) {
                if(!channel){
                    models.my_channels.findOne({
                        attributes: ['title'],
                        where: {channel_number: req.body.channel_number}
                    }).then(function (user_channel) {
                        if(!user_channel){
                            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                        }
                        else callback(null, user_channel);
                    }).catch(function(error) {
                        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                    });
                }
                else callback(null, channel.title);
            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
        },
        get_epg: ['get_channel', function(results, callback) {
            models.epg_data.findAll({
                attributes: [ 'id', 'title', 'short_description', 'short_name', 'duration_seconds', 'program_start', 'program_end' ],
                order: [['program_start', 'ASC']],
                include: [
                    {
                        model: models.channels, required: true, attributes: [],  where: {channel_number: req.body.channel_number},
                        include: {model: models.packages_channels, required: true, attributes:[],
                            include:[{model: models.package, required: true, attributes: [],
                                where: {package_type_id: req.auth_obj.screensize},
                                include:[{model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}}
                                ]}
                            ]}
                    },
                    {model: models.program_schedule,
                        required: false, //left join
                        attributes: ['id'],
                        where: {login_id: req.thisuser.id}
                    }
                ],
                where: {program_start: {gte: interval_start}, program_end:{lte: interval_end}}
            }).then(function (result) {
                if(!result){
                    callback(null, results.get_channel, []); //no epg for this channel, passing empty array instead
                }
                else callback(null, results.get_channel, result);
            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
        }],
        send_epg: ['get_epg', function(epg_data, callback) {
            var raw_result = [];
            if(epg_data.get_epg[1].length<3){
                for(var i=0; i<3-epg_data.get_epg[1].length; i++){
                    var temp_obj = {};
                    temp_obj.channelName = epg_data.get_epg[0].title;
                    temp_obj.id = -1;
                    temp_obj.number = req.body.channel_number;
                    temp_obj.title = "Program of "+epg_data.get_epg[0].title;
                    temp_obj.scheduled = false;
                    temp_obj.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
                    temp_obj.shortname = "Program of "+epg_data.get_epg[0].title;
                    temp_obj.programstart = '01/01/1970 00:00:00';
                    temp_obj.programend = '01/01/1970 00:00:00';
                    temp_obj.duration = 0; //duration 0 for non-real epg
                    temp_obj.progress = 0; //progress 0 for non-real epg
                    temp_obj.status = 0; //status 0 means this is non-real epg
                    raw_result.push(temp_obj);
                }
            }
            for(var i=0; i<epg_data.get_epg[1].length; i++){
                var temp_obj = {};
                var programstart = parseInt(epg_data.get_epg[1][i].program_start.getTime()) +  parseInt((client_timezone) * 3600000);
                var programend = parseInt(epg_data.get_epg[1][i].program_end.getTime()) +  parseInt((client_timezone) * 3600000);

                temp_obj.channelName = epg_data.get_epg[1][i].title;
                temp_obj.id = epg_data.get_epg[1][i].id;
                temp_obj.number = req.body.channel_number;
                temp_obj.title = epg_data.get_epg[1][i].title;
                temp_obj.scheduled = (!epg_data.get_epg[1][i].program_schedules[0]) ? false : schedule.is_scheduled(epg_data.get_epg[1][i].program_schedules[0].id);
                temp_obj.status = program_status(epg_data.get_epg[1][i].program_start.getTime(), epg_data.get_epg[1][i].program_end.getTime());
                temp_obj.description = epg_data.get_epg[1][i].short_description;
                temp_obj.shortname = epg_data.get_epg[1][i].short_name;
                temp_obj.programstart = dateFormat(programstart, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                temp_obj.programend = dateFormat(programend, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                temp_obj.duration = epg_data.get_epg[1][i].duration_seconds;
                temp_obj.progress = Math.round((Date.now() - epg_data.get_epg[1][i].program_start.getTime() ) / (epg_data.get_epg[1][i].duration_seconds * 10));
                raw_result.push(temp_obj);
            }
            response.send_res(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
        }]
    }, function(error, results) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

// returns list of epg data all of this user's channels that are being palyed right now
exports.current_epgs =  function(req, res) {
    var server_time = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss"); //start of the day for the user, in server time
    var raw_result = [];

    var qwhere = {};
    if(req.thisuser.show_adult == 0) qwhere.pin_protected = 0; //show adults filter
    else qwhere.pin_protected != ''; //avoid adult filter

    // requisites for streams provided by the user
    var userstream_qwhere = {"isavailable": true, "login_id": req.thisuser.id};

    // requisites for streams served by the company
    var stream_qwhere = {};
    if(req.thisuser.player.toUpperCase() === 'default'.toUpperCase()) stream_qwhere.stream_format = {$not: 0}; //don't send mpd streams for default player
    if(req.auth_obj.appid === 3) stream_qwhere.stream_format = 2; // send only hls streams for ios application
    stream_qwhere.stream_source_id = req.thisuser.channel_stream_source_id; // streams come from the user's stream source
    stream_qwhere.stream_mode = 'live';

    models.my_channels.findAll({
        attributes: ['channel_number', 'title'], order: [[ 'channel_number', 'ASC' ]], where: userstream_qwhere,
        include: [{ model: models.genre, required: true, attributes: ['icon_url'], where: {is_available: true} }]
    }).then(function (user_channel) {
        models.channels.findAll({
            attributes: ['title', 'channel_number'], order: [[ 'channel_number', 'ASC' ]], where: qwhere,
            include: [
                {model: models.packages_channels,
                    required: true,
                    attributes:[],
                    include:[
                        {model: models.package,
                            required: true,
                            attributes: [],
                            where: {package_type_id: req.auth_obj.screensize},
                            include:[
                                {model: models.subscription,
                                    required: true,
                                    attributes: [],
                                    where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                                }
                            ]}
                    ]},
                { model: models.channel_stream, required: true, attributes:[] },
                {
                    model: models.epg_data, required: false,
                    attributes: [
                        'id', 'short_description', 'short_name', 'duration_seconds',
                        db_funct.final_time('program_start', 'program_start', 'HOUR', req.body.device_timezone, '%m/%d/%Y %H:%i:%s'),
                        db_funct.final_time('program_end', 'program_end', 'HOUR', req.body.device_timezone, '%m/%d/%Y %H:%i:%s'),
                        db_funct.add_constant(false, 'scheduled')
                    ],
                    where: {program_start: {lte: server_time}, program_end: {gte: server_time}}
                }
            ]
        }).then(function (channels) {
            for(var i=0; i< channels.length; i++){
                var raw_obj = {};
                raw_obj.channelName =  channels[i].title;
                raw_obj.title =  channels[i].title;
                raw_obj.number =  channels[i].channel_number;
                raw_obj.id = (channels[i].epg_data[0]) ? channels[i].epg_data[0].id : -1;
                raw_obj.scheduled = false;
                raw_obj.shortname = (channels[i].epg_data[0]) ? channels[i].epg_data[0].short_name : "Program of "+ channels[i].title;
                raw_obj.description = (channels[i].epg_data[0]) ?  channels[i].epg_data[0].short_description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
                raw_obj.programstart = (channels[i].epg_data[0]) ? channels[i].epg_data[0].program_start : "01/01/1970 00:00:00";
                raw_obj.programend = (channels[i].epg_data[0]) ? channels[i].epg_data[0].program_end : "01/01/1970 00:00:00";
                raw_obj.duration = (channels[i].epg_data[0]) ? channels[i].epg_data[0].duration_seconds : 0;
                raw_obj.progress = (channels[i].epg_data[0]) ? Math.round(((Date.now() + 3600000*req.body.device_timezone) - moment(channels[i].epg_data[0].program_start, 'MM/DD/YYYY HH:mm:ss').format('x')) / (channels[i].epg_data[0].duration_seconds * 10)) : 0;
                raw_obj.status = 2;

                raw_result.push(raw_obj);
            }
            if(user_channel){
                for(var i=0; i<user_channel.length; i++){
                    var raw_obj = {};
                    raw_obj.channelName =  user_channel[i].title;
                    raw_obj.title =  user_channel[i].title;
                    raw_obj.number =  user_channel[i].channel_number;
                    raw_obj.id = -1;
                    raw_obj.scheduled = false;
                    raw_obj.shortname = "Program of "+ user_channel[i].title;
                    raw_obj.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
                    raw_obj.programstart = "01/01/1970 00:00:00";
                    raw_obj.programend = "01/01/1970 00:00:00";
                    raw_obj.duration = 0;
                    raw_obj.progress = 0;
                    raw_obj.status = 2;
                    raw_result.push(raw_obj);
                }
            }
            response.send_res(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=43200');
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

//API for favorites. Performs a delete or insert - depending on the action parameter.
exports.favorites = function(req, res) {
    async.waterfall([
        //GETTING USER DATA
        function(callback) {
            models.login_data.findOne({
                attributes: ['id'], where: {username: req.auth_obj.username}
            }).then(function (user) {
                callback(null, user.id);
                return null;
            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
        },
        function(user_id, callback) {
            models.channels.findOne({
                attributes: ['id'], where: {channel_number: req.body.channelNumber}
            }).then(function (channel) {
                callback(null, user_id, channel.id);
                return null;
            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
        },
        function(user_id, channel_id) {
            if(req.body.action == "1"){
                models.favorite_channels.create({
                    channel_id: channel_id,
                    user_id: user_id
                }).then(function (result) {
                    var extra_data = "user "+req.auth_obj.username+" action "+req.body.action+" channel "+req.body.channelNumber; //todo: dynamic response
                    response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
                }).catch(function(error) {
                    response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                });
            }
            else if(req.body.action == "0"){
                models.favorite_channels.destroy({
                    where: {
                        channel_id: channel_id,
                        user_id: user_id
                    }
                }).then(function (result) {
                    var extra_data = "user "+req.auth_obj.username+" action "+req.body.action+" channel "+req.body.channelNumber; //todo: dynamic response
                    response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
                }).catch(function(error) {
                    response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                });
            }
        }
    ], function (err) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

//API for scheduling.
exports.program_info = function(req, res) {
    models.epg_data.findOne({
        attributes: ['title', 'long_description', 'program_start', 'program_end'],
        where: {id: req.body.program_id},
        include: [
            {
                model: models.channels, required: true, attributes: ['title', 'description'],
                include: [{
                    model: models.genre, required: true, attributes: [ 'description']
                }]
            },
            {model: models.program_schedule,
                required: false, //left join
                attributes: ['id'],
                where: {login_id: req.thisuser.id}
            }
        ]
    }).then(function (epg_program) {
        if(!epg_program){
            clear_response.response_object = [{
                "genre": '',
                "program_title": '',
                "program_description": '',
                "channel_title": '',
                "channel_description": '',
                "status": '',
                "scheduled": false
            }];
        }
        else {
            var status = '';
            if (epg_program.program_start.getTime() > Date.now()) {
                status = 'future';
            }
            else if (epg_program.program_end.getTime() < Date.now()) {
                status = 'catchup';
            }
            else {
                status = 'live';
            }
            var response_data = [{
                "genre": (epg_program.channel.genre.description) ? epg_program.channel.genre.description : '',
                "program_title": (epg_program.title) ? epg_program.title : '',
                "program_description": (epg_program.long_description) ? epg_program.long_description : '',
                "channel_title": (epg_program.channel.title) ? epg_program.channel.title : '',
                "channel_description": (epg_program.channel.description) ? epg_program.channel.description : '',
                "status": status,
                "scheduled": (!epg_program.program_schedules[0]) ? false : schedule.is_scheduled(epg_program.program_schedules[0].id)
            }];
        }
        response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

//API for scheduling.
exports.schedule = function(req, res) {
    //todo: dynamic multi-language  response object for success cases
    models.epg_data.findOne({
        attributes: ['id', 'channel_number', 'program_start'],
        where: {id: req.body.program_id}
    }).then(function (epg_program) {
        if(epg_program){
            models.program_schedule.findOne({
                attributes: ['id'], where: {login_id: req.thisuser.id, program_id: req.body.program_id},
            }).then(function (scheduled) {
                if(!scheduled){
                    models.program_schedule.create({
                        login_id: req.thisuser.id,
                        program_id: req.body.program_id
                    }).then(function (scheduled){
                        var response_data = [{
                            "action": 'created'
                        }];
                        //programstart is converted to unix time, decreased by 5 min, decreased by current time. This gives the difference between the current time and 5 min before the start of the program
                        schedule.schedule_program(moment(epg_program.program_start).format('x') - Date.now() - 300000, scheduled.id, req.thisuser.id, epg_program.channel_number, req.body.program_id);
                        response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
                    }).catch(function(error) {
                        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                    });
                }
                else{
                    var eventid = scheduled.id;
                    models.program_schedule.destroy({
                        where: {login_id: req.thisuser.id, program_id: req.body.program_id}
                    }).then(function (result){
                        var response_data = [{
                            "action": 'destroyed'
                        }];
                        schedule.unschedule_program(eventid);
                        response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
                    }).catch(function(error) {
                        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                    });
                }
                return null;
            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
        }
        else{
            var response_data = [{
                "action": 'no action'
            }];
            response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
        }
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

function has_catchup(catchup_streams, channel_id){
    var theposition = catchup_streams.filter(function(item) {
        return item.channel_id == channel_id;
    });
    if(theposition[0]){
        return 'catchup';
    }
    else return 'live';
}

function program_status(programstart, programend){
    if(programstart < Date.now() && programend < Date.now()){
        return 1;
    }
    else if(programstart < Date.now() && programend > Date.now()){
        return 2;
    }
    else return 3
}
