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
 *          "drm_platform": "drm_platform",
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
    stream_qwhere.stream_mode = 'live'; //filter streams based on device resolution
    stream_qwhere.stream_resolution = (req.auth_obj.screensize === 1) ? {like: '%large%'} : {like: '%small%'};

    // requisites for catchup streams
    var catchupstream_where = {stream_source_id: req.thisuser.channel_stream_source_id};
    if(req.thisuser.player.toUpperCase() === 'default'.toUpperCase()) catchupstream_where.stream_format = {$not: 0}; //don't send mpd streams for default player
    if(req.auth_obj.appid === 3) catchupstream_where.stream_format = 2; // send only hls streams for ios application
    catchupstream_where.stream_mode = 'catchup'; //filter streams based on device resolution
    catchupstream_where.stream_resolution = (req.auth_obj.screensize === 1) ? {like: '%large%'} : {like: '%small%'};

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
                        attributes: ['stream_source_id','stream_url','stream_format', 'drm_platform', 'token','token_url','is_octoshape','encryption','encryption_url'],
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
                    temp_obj.drm_platform = "none";
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
                    result[i].drm_platform = result[i]["channel_streams.drm_platform"]; delete result[i]["channel_streams.drm_platform"];
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
 * @api {GET} /apiv2/channels/list Get LiveTV Channels List
 * @apiName GetChannelsList
 * @apiGroup Channels
 *
 * @apiHeader {String} auth Encrypted string composed of username, password, appid, boxid and timestamp.
 *
 * @apiDescription Copy paste this auth for testing purposes
 *
 * auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */

exports.list_get = function(req, res) {
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
    stream_qwhere.stream_mode = 'live'; //filter streams based on device resolution
    stream_qwhere.stream_resolution = (req.auth_obj.screensize === 1) ? {like: '%large%'} : {like: '%small%'};

    // requisites for catchup streams
    var catchupstream_where = {stream_source_id: req.thisuser.channel_stream_source_id};
    if(req.thisuser.player.toUpperCase() === 'default'.toUpperCase()) catchupstream_where.stream_format = {$not: 0}; //don't send mpd streams for default player
    if(req.auth_obj.appid === 3) catchupstream_where.stream_format = 2; // send only hls streams for ios application
    catchupstream_where.stream_mode = 'catchup'; //filter streams based on device resolution
    catchupstream_where.stream_resolution = (req.auth_obj.screensize === 1) ? {like: '%large%'} : {like: '%small%'};

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
                        attributes: ['stream_source_id','stream_url','stream_format','token','token_url','is_octoshape','drm_platform','encryption','encryption_url'],
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
                    temp_obj.drm_platform = "none";
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
                    result[i].drm_platform = result[i]["channel_streams.drm_platform"]; delete result[i]["channel_streams.drm_platform"];
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
    var stream_mode = 'catchup';
    var stream_resolution = (req.auth_obj.screensize === 1) ? {like: '%large%'} : {like: '%small%'};
    models.epg_data.findOne({
        attributes: ['title', 'long_description', 'program_start', 'program_end'],
        where: {id: req.body.program_id},
        include: [
            {
                model: models.channels, required: true, attributes: ['title', 'description'],
                include: [
                    {model: models.genre, required: true, attributes: [ 'description']},
                    {model: models.channel_stream, required: false, attributes: [ 'id'], where: {stream_mode: stream_mode, stream_resolution: stream_resolution}}
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
