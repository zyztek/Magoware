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


//RETURNS LIST OF CHANNELS AVAILABLE TO THE USER FOR THIS DEVICE
/**
 * @api {POST} /apiv2/channels/list Channels - Livetv and personal channel list
 * @apiName channel_list
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": '',
 *       "response_object": [
 *       {
 *          "id": 1,
 *          "channel_number": 100,
 *          "title": "title",
 *          "icon_url": "http://.../image.png",
 *          "stream_url": "stream url",
 *          "genre_id": 1,
 *          "channel_mode": "live",
 *          "pin_protected": "false", //"true" / "false" values
 *          "stream_source_id": 1,
 *          "stream_format": "0", //current values include 0 (mpd), 1 (smooth streaming), 2 (hls), 3 (other)
 *          "token": 1, // values 0 / 1
 *          "token_url": "token url",
 *          "encryption": 0, // values 0 / 1
 *          "encryption_url": "encryption url",
 *          "is_octoshape": 0, // values 0 / 1
 *          "favorite_channel": "0" // values "0" / "1"
 *       }, ....
 *       ]
 *   }
 */
exports.list = function(req, res) {
    var qwhere = {};
    //qwhere.isavailable = true;
    if(req.thisuser.show_adult == 0) qwhere.pin_protected = 0; //show adults filter
    else qwhere.pin_protected != ''; //avoid adult filter
    qwhere.isavailable = 1;

    // requisites for streams provided by the user
    var userstream_qwhere = {"isavailable": true, "login_id": req.thisuser.id};

    // requisites for streams served by the company
    var stream_qwhere = {};
    if(req.thisuser.player.toUpperCase() === 'default'.toUpperCase()) stream_qwhere.stream_format = {$not: 0}; //don't send mpd streams for default player
    if(req.auth_obj.appid === 3) stream_qwhere.stream_format = 2; // send only hls streams for ios application
    stream_qwhere.stream_source_id = req.thisuser.channel_stream_source_id; // streams come from the user's stream source
    stream_qwhere.stream_mode = (['2', '3'].indexOf(req.auth_obj.appid) !== -1) ? 'live_small' : 'live_large'; //filter streams based on device resolution

    // requisites for catchup streams
    var catchupstream_where = {stream_source_id: req.thisuser.channel_stream_source_id};
    if(req.thisuser.player.toUpperCase() === 'default'.toUpperCase()) catchupstream_where.stream_format = {$not: 0}; //don't send mpd streams for default player
    if(req.auth_obj.appid === 3) catchupstream_where.stream_format = 2; // send only hls streams for ios application
    catchupstream_where.stream_mode = (['2', '3'].indexOf(req.auth_obj.appid) !== -1) ? 'catchup_small' : 'catchup_large'; //filter streams based on device resolution

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
                    temp_obj.channel_mode = 'live_large';
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


//RETURNS LIST OF CHANNELS AVAILABLE TO THE USER FOR THIS DEVICE USING GET METHOD
/**
 * @api {GET} /apiv2/channels/list Channels - Livetv and personal channel list
 * @apiName channel_list
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": '',
 *       "response_object": [
 *       {
 *          "id": 1,
 *          "channel_number": 100,
 *          "title": "title",
 *          "icon_url": "http://.../image.png",
 *          "stream_url": "stream url",
 *          "genre_id": 1,
 *          "channel_mode": "live_large",
 *          "pin_protected": "false", //"true" / "false" values
 *          "stream_source_id": 1,
 *          "stream_format": "0", //current values include 0 (mpd), 1 (smooth streaming), 2 (hls), 3 (other)
 *          "token": 1, // values 0 / 1
 *          "token_url": "token url",
 *          "encryption": 0, // values 0 / 1
 *          "encryption_url": "encryption url",
 *          "is_octoshape": 0, // values 0 / 1
 *          "favorite_channel": "0" // values "0" / "1"
 *       }, ....
 *       ]
 *   }
 */

exports.list_get = function(req, res) {
    console.log('enter get fnction');
    var qwhere = {};
    qwhere.isavailable = true;
    if(req.thisuser.show_adult == 0) qwhere.pin_protected = 0; //show adults filter
    else qwhere.pin_protected != ''; //avoid adult filter
    qwhere.isavailable = 1;

    // requisites for streams provided by the user
    var userstream_qwhere = {"isavailable": true, "login_id": req.thisuser.id};

    // requisites for streams served by the company
    var stream_qwhere = {};
    if(req.thisuser.player.toUpperCase() === 'default'.toUpperCase()) stream_qwhere.stream_format = {$not: 0}; //don't send mpd streams for default player
    if(req.auth_obj.appid === 3) stream_qwhere.stream_format = 2; // send only hls streams for ios application
    stream_qwhere.stream_source_id = req.thisuser.channel_stream_source_id; // streams come from the user's stream source
    stream_qwhere.stream_mode = (['2', '3'].indexOf(req.auth_obj.appid) !== -1) ? 'live_small' : 'live_large'; //filter streams based on device resolution

    // requisites for catchup streams
    var catchupstream_where = {stream_source_id: req.thisuser.channel_stream_source_id};
    if(req.thisuser.player.toUpperCase() === 'default'.toUpperCase()) catchupstream_where.stream_format = {$not: 0}; //don't send mpd streams for default player
    if(req.auth_obj.appid === 3) catchupstream_where.stream_format = 2; // send only hls streams for ios application
    catchupstream_where.stream_mode = (['2', '3'].indexOf(req.auth_obj.appid) !== -1) ? 'catchup_small' : 'catchup_large'; //filter streams based on device resolution

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
                    temp_obj.channel_mode = 'live_large';
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
                response.send_res_get(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');

            }).catch(function(error) {
                response.send_res_get(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
            return null;
        }).catch(function(error) {
            response.send_res_get(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res_get(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};


//RETURNS LIST OF LIVE TV GENRES, INCLUDING A STATIC FAVORITE GENRE
/**
 * @api {POST} /apiv2/channels/genre Channels - genre list
 * @apiName livetv_genre_list
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'OK_DATA',
 *       "response_object": [
 *       {
 *          "id": 1,
 *          "name": "genre name"
 *       }, ....
 *       ]
 *   }
 */
exports.genre = function(req, res) {
    models.genre.findAll({
        attributes: ['id',['description', 'name'], [Sequelize.fn('concat', req.app.locals.settings.assets_url, Sequelize.col('icon_url')), 'icon'] ],
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


//RETURNS LIST OF LIVE TV GENRES, INCLUDING A STATIC FAVORITE GENRE - GET METHOD
/**
 * @api {POST} /apiv2/channels/genre Channels - genre list
 * @apiName livetv_genre_list
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'OK_DATA',
 *       "response_object": [
 *       {
 *          "id": 1,
 *          "name": "genre name"
 *       }, ....
 *       ]
 *   }
 */
exports.genre_get = function(req, res) {
    models.genre.findAll({
        attributes: ['id',['description', 'name'], [Sequelize.fn('concat', req.app.locals.settings.assets_url, Sequelize.col('icon_url')), 'icon'] ],
        where: {is_available: true}
    }).then(function (result) {
        var favorite_genre = {
            "id": 666,
            "name": "Favorites"
        };
        var response_data = result.concat(favorite_genre);
        response.send_res_get(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res_get(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};




//RETURNS 4 hours of Epg for the channels listed in the number parameter
/**
 * @api {POST} /apiv2/channels/epg Channels - 4 hour epg
 * @apiName livetv_4hour_epg
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 * @apiParam {String} number Comma-separated list of channel numbers.
 * @apiParam {Number} timeshift Represents number of epg page in the application
 * @apiParam {Number} device_timezone Timezone offset of the device. Values in range of [-12:12]
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'OK_DATA',
 *       "response_object": [
 *       {
 *          "channelName": "channel name",
 *          "number": 100, //channel number
 *          "id": 1, //-1 for default epgs
 *          "scheduled": true, //values true/false
 *          "title": "event title",
 *          "description": "short event description",
 *          "shortname": "event short name",
 *          "programstart": "mm/dd/yyyy HH:MM:ss",
 *          "programend": "mm/dd/yyyy HH:MM:ss",
 *          "duration": 1800 //in seconds
 *       }, ....
 *       ]
 *   }
 */
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


//RETURNS 4 hours of Epg for the channels listed in the number parameter - GET METHOD
/**
 * @api {POST} /apiv2/channels/epg Channels - 4 hour epg
 * @apiName livetv_4hour_epg
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 * @apiParam {String} number Comma-separated list of channel numbers.
 * @apiParam {Number} timeshift Represents number of epg page in the application
 * @apiParam {Number} device_timezone Timezone offset of the device. Values in range of [-12:12]
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'OK_DATA',
 *       "response_object": [
 *       {
 *          "channelName": "channel name",
 *          "number": 100, //channel number
 *          "id": 1, //-1 for default epgs
 *          "scheduled": true, //values true/false
 *          "title": "event title",
 *          "description": "short event description",
 *          "shortname": "event short name",
 *          "programstart": "mm/dd/yyyy HH:MM:ss",
 *          "programend": "mm/dd/yyyy HH:MM:ss",
 *          "duration": 1800 //in seconds
 *       }, ....
 *       ]
 *   }
 */
exports.epg_get = function(req, res) {
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
        response.send_res_get(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=43200');
    }).catch(function(error) {
        response.send_res_get(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};



//RETURNS 12 hours of future Epg for a given channel
/**
 * @api {POST} /apiv2/channels/event Channels - 12 hour epg
 * @apiName livetv_12hour_epg
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 * @apiParam {Number} channelNumber Channel numbers.
 * @apiParam {Number} device_timezone Timezone offset of the device. Values in range of [-12:12]
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'OK_DATA',
 *       "response_object": [
 *       {
 *          "channelName": "channel name",
 *          "id": 1, //-1 for default epgs
 *          "number": 100, //channel number
 *          "title": "event title",
 *          "scheduled": true, //values true/false
 *          "description": "short event description",
 *          "shortname": "event short name",
 *          "programstart": "mm/dd/yyyy HH:MM:ss",
 *          "programend": "mm/dd/yyyy HH:MM:ss",
 *          "duration": 1800, //in seconds
 *          "progress": 20 //value in range [0:100] for current event, <0 for future events
 *       }, ....
 *       ]
 *   }
 */
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



//RETURNS 12 hours of future Epg for a given channel - GET METHOD
/**
 * @api {POST} /apiv2/channels/event Channels - 12 hour epg
 * @apiName livetv_12hour_epg
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 * @apiParam {Number} channelNumber Channel numbers.
 * @apiParam {Number} device_timezone Timezone offset of the device. Values in range of [-12:12]
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'OK_DATA',
 *       "response_object": [
 *       {
 *          "channelName": "channel name",
 *          "id": 1, //-1 for default epgs
 *          "number": 100, //channel number
 *          "title": "event title",
 *          "scheduled": true, //values true/false
 *          "description": "short event description",
 *          "shortname": "event short name",
 *          "programstart": "mm/dd/yyyy HH:MM:ss",
 *          "programend": "mm/dd/yyyy HH:MM:ss",
 *          "duration": 1800, //in seconds
 *          "progress": 20 //value in range [0:100] for current event, <0 for future events
 *       }, ....
 *       ]
 *   }
 */
exports.event_get =  function(req, res) {
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



//RETURNS ENTIRE EPG FOR A SPECIFIC CHANNEL IN A SPECIFIC DAY
/**
 * @api {POST} /apiv2/channels/daily_epg Channels - daily epg
 * @apiName livetv_daily_epg
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 * @apiParam {Number} channel_number Channel number
 * @apiParam {Number} device_timezone Timezone offset of the device. Values in range of [-12:12]
 * @apiParam {Number} day 0 for today, -x/x for other days.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'OK_DATA',
 *       "response_object": [
 *       {
 *          "channelName": "channel name"
 *          "id": 1, //-1 for default epgs
 *          "number": 100, //channel number
 *          "title": "event title",
 *          "scheduled": true, //values true/false
 *          "description": "short event description",
 *          "shortname": "event short name",
 *          "programstart": "mm/dd/yyyy HH:MM:ss",
 *          "programend": "mm/dd/yyyy HH:MM:ss",
 *          "duration": 1800, //in seconds
 *          "progress": 20 //value in range [0:100] for current event, <0 for future events
 *          "status": 2 // 1 for past, 2 for current, 3 for future events
 *       }, ....
 *       ]
 *   }
 */
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
                return null;
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
                    temp_obj.channelName = epg_data.get_epg[0];
                    temp_obj.id = -1;
                    temp_obj.number = req.body.channel_number;
                    temp_obj.title = "Program of "+epg_data.get_epg[0];
                    temp_obj.scheduled = false;
                    temp_obj.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
                    temp_obj.shortname = "Program of "+epg_data.get_epg[0];
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

//RETURNS EPG FOR PROGRAMS CURRENTLY BEING TRANSMITTED IN THE USER'S SUBSCRIBED CHANNELS FOR THIS DEVICE
/**
 * @api {POST} /apiv2/channels/current_epgs Channels - current epg
 * @apiName livetv_current_epg
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 * @apiParam {Number} device_timezone Timezone offset of the device. Values in range of [-12:12]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'OK_DATA',
 *       "response_object": [
 *       {
 *          "channelName": "channel name"
 *          "title": "event title",
 *          "number": 100, //channel number
 *          "id": 1, //-1 for default epgs
 *          "scheduled": true, //values true/false
 *          "shortname": "event short name",*
 *          "description": "short event description",
 *          "programstart": "mm/dd/yyyy HH:MM:ss",
 *          "programend": "mm/dd/yyyy HH:MM:ss",
 *          "duration": 1800, //in seconds
 *          "progress": 20 //value in range [0:100] for current event, <0 for future events
 *          "status": 2 // static value, means that the event is currently being transmitted
 *       }, ....
 *       ]
 *   }
 */
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
    stream_qwhere.stream_mode = 'live_large';

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

//API FOR FAVORITE CHANNELS. ADDS OR REMOVES A CHANNEL FROM THE USER FAVORITES LIST
/**
 * @api {POST} /apiv2/channels/current_epgs Channels - favorite channel
 * @apiName livetv_favorite_channel
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 * @apiParam {Number} channelNumber Number of the channel to be added / removed from favorites
 * @apiParam {Number} action 0 to remove, 1 to add to favorites
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'informin message', //message informs of the action (add/remove) performed for user and channel
 *       "response_object": []
 *   }
 */
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
                    var extra_data = "Added channel "+req.body.channelNumber+" as a favorite of user "+req.auth_obj.username; //todo: dynamic response
                    response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', extra_data, 'private,max-age=86400');
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
                    var extra_data = "Removed channel "+req.body.channelNumber+" from the list of favorites for user "+req.auth_obj.username; //todo: dynamic response
                    response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', extra_data, 'private,max-age=86400');
                }).catch(function(error) {
                    response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                });
            }
        }
    ], function (err) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};




//PROVIDES INFORMATION OVER A SINGLE PROGRAM
/**
 * @api {POST} /apiv2/channels/program_info Channels - info on a program
 * @apiName program_info
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 * @apiParam {Number} program_id Id  of the program to be scheduled / unscheduled
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'OK_DATA', //message informs of the action (add/remove) performed for user and channel
 *       "response_object": [
 *          "genre": "channel genre",
 *          "program_title": "program title",
 *          "program_description": " program description",
 *          "channel_title": "channel name",
 *          "channel_description": "channel descrption",
 *          "status": "future", // values future for future events, catchup for past events, live for events currently being transmited
 *          "scheduled": true // values true / false,
 *          "has_catchup": true //values true/false
 *       ]
 *   }
 */
exports.program_info = function(req, res) {
    var stream_mode = (['2', '3'].indexOf(req.auth_obj.appid) !== -1) ? 'catchup_small' : 'catchup_large'
    models.epg_data.findOne({
        attributes: ['title', 'long_description', 'program_start', 'program_end'],
        where: {id: req.body.program_id},
        include: [
            {
                model: models.channels, required: true, attributes: ['title', 'description'],
                include: [
                    {model: models.genre, required: true, attributes: [ 'description']},
                    {model: models.channel_stream, required: false, attributes: [ 'id'], where: {stream_mode: stream_mode}}
                ]
            },
            {model: models.program_schedule,
                required: false, //left join
                attributes: ['id'],
                where: {login_id: req.thisuser.id}
            }
        ]
    }).then(function (epg_program) {
        if(!epg_program){
            var response_data = [{
                "genre": '',
                "program_title": '',
                "program_description": '',
                "channel_title": '',
                "channel_description": '',
                "status": '',
                "scheduled": false,
                "has_catchup": false
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
                "scheduled": (!epg_program.program_schedules[0]) ? false : schedule.is_scheduled(epg_program.program_schedules[0].id),
                "has_catchup": (epg_program.channel.channel_streams[0]) ? true : false
            }];
        }
        response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

//SCHEDULES / UNSCHEDULES A PROGRAM FOR A USER.
/**
 * @api {POST} /apiv2/channels/schedule Channels - schedule event
 * @apiName schedule_event
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 * @apiParam {Number} program_id Id  of the program to be scheduled / unscheduled
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1517479302000, //unix timestamp in milliseconds
 *       "error_description": 'OK',
 *       "extra_data": 'OK_DATA', //message informs of the action (add/remove) performed for user and channel
 *       "response_object": [
 *          "action": "created" // values are created / destroyed / no action
 *       ]
 *   }
 */
exports.schedule = function(req, res) {
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
                        var firebase_key = req.app.locals.settings.firebase_key;
                        //programstart is converted to unix time, decreased by 5 min, decreased by current time. This gives the difference between the current time and 5 min before the start of the program
                        schedule.schedule_program(moment(epg_program.program_start).format('x') - Date.now() - 300000, firebase_key, scheduled.id, req.thisuser.id, epg_program.channel_number, req.body.program_id);
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
