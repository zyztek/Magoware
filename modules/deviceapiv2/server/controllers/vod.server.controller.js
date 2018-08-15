'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    sequelize = require('sequelize'),
    response = require(path.resolve("./config/responses.js")),
    crypto = require('crypto'),
    models = db.models,
    winston = require(path.resolve('./config/lib/winston'));
var sequelizes =  require(path.resolve('./config/lib/sequelize'));
var async = require('async');



//RETURNS LIST OF VOD PROGRAMS VIA GET Request
/**
 * @api {post} /apiv2/vod/listnewdata/:pagenumber /apiv2/vod/listnewdata/:pagenumber
 * @apiVersion 0.2.0
 * @apiName GetVodNewDataList
 * @apiGroup DeviceAPI
 * @apiParam {String} auth Encrypted authentication token string.
 * @apiDescription Returns a chunk of video on demand assets/movies that have been modified
 * @apiSuccessExample Success-Response:
 *     {
 *       "status_code": 200,
 *       "error_code": 1,
 *       "timestamp": 1,
 *       "error_description": "OK",
 *       "extra_data": "LOGOUT_OTHER_DEVICES",
 *       "response_object": [
 *			    {
 *			    	"id": "2",
 *			    	"title": "Snow Queen",
 *			    	"pin_protected": 1,
 *			    	"duration": 62,
 *			    	"description": "A young woman must journey",
 *			       	"icon": "http://localhost:66/files/vod/1494845668363snowqueen.jpg",
 *			    	"largeimage": "http://localhost:66/files/vod/1494846125084snowwall.jpg",
 *			    	"categoryid": "42",
 *			    	"dataadded": 1485710820000,
 *			    	"rate": "1",
 *			    	"year": "2016",
 *			    	"token": "0",
 *			    	"TokenUrl": "",
 *			    	"encryption": "0",
 *			    	"encryption_url": "",
 *			    	"isavailable": true
 *			    }, ....
 *		    ]
 *      }
 * @apiErrorExample Error-Response:
 *     {
 *       "status_code": 706,
 *       "error_code": -1,
 *       "timestamp": 1,
 *       "error_description": "DATABASE_ERROR",
 *       "extra_data": "Error connecting to database",
 *       "response_object": []
 *     }
 */
exports.list_get_newdata = function(req, res) {
    //var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.subscription.findAll({
        attributes: ['package_id'], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}, group: ['package_id'],
        include: [{
            model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 }, include: [{
                model: models.package_vod, required: true, attributes: []
            }]
        }],
        raw: true
    }).then(function(result){
        if(result && result.length > 0){
            var package_list = [];
            for(var i=0; i<result.length; i++){
                package_list.push(result[i].package_id); //list of packages into array
            }
            var allowed_content = [0,1]; //(req.thisuser.show_adult === true) ? [0, 1] : [0];

            var offset = (!req.params.pagenumber || req.params.pagenumber === '-1') ? 0 : ((parseInt(req.params.pagenumber)-1)*req.app.locals.settings.vod_subset_nr); //for older versions of vod, start query at first record
            var limit = (!req.params.pagenumber || req.params.pagenumber === '-1') ? 99999999999 : req.app.locals.settings.vod_subset_nr; //for older versions of vod, set limit to 99999999999


            if(isNaN(req.headers['etag'])) {
                var tmptimestamp = 0;
            }
            else {
                var tmptimestamp = Number(req.headers['etag'])
            }


            models.vod.findAll({
                attributes: ['id', 'title', 'pin_protected', 'duration', 'description', 'director', 'starring', 'createdAt', 'rate', 'year', 'icon_url', 'image_url', 'isavailable'],
                include: [
                    {model: models.vod_stream, required: true, attributes: ['url', 'encryption', 'token', 'stream_format', 'token_url'], where: {stream_source_id: req.thisuser.vod_stream_source}},
                    {model: models.vod_vod_categories, required: true, attributes: ['category_id'], where:{is_available: true}, include: [{model: models.vod_category, attributes: ['name']}]},
                    {model: models.package_vod, required: true, attributes: [], where: {package_id: {in: package_list}}}
                ],
                where: {pin_protected:{in: allowed_content}, isavailable: true, updatedAt:{gt: tmptimestamp}, expiration_time: {$gte: Date.now()}},
                offset: offset,
                limit: limit
            }).then(function (result) {
                var raw_result = [];
                //flatten nested json array
                result.forEach(function(obj){
                    var raw_obj = {};

                    Object.keys(obj.toJSON()).forEach(function(k) {
                        if (typeof obj[k] == 'object') {
                            Object.keys(obj[k]).forEach(function(j) {
                                var category_list = "";
                                for(var i=0; i<obj.vod_vod_categories.length; i++){
                                    if(category_list.length > 0) category_list += ", " + obj.vod_vod_categories[i].vod_category.name;
                                    else category_list += obj.vod_vod_categories[i].vod_category.name;
                                }
                                raw_obj.id = String(obj.id);
                                raw_obj.title = obj.title;
                                raw_obj.pin_protected = obj.pin_protected;
                                raw_obj.duration = obj.duration;
                                raw_obj.stream_format = obj[k][j].stream_format;
                                raw_obj.url = obj[k][j].url;
                                raw_obj.description = obj.description + ' <p><strong>Director:</strong> ' + obj.director + '</p><p><strong>Starring:</strong> ' + obj.starring+'</p>';
                                raw_obj.icon = req.app.locals.settings.assets_url+obj.icon_url;
                                raw_obj.largeimage = req.app.locals.settings.assets_url+obj.image_url;
                                raw_obj.categoryid = String(obj.vod_vod_categories[0].category_id);
                                raw_obj.categories = category_list;
                                raw_obj.dataadded = obj.createdAt.getTime();
                                raw_obj.rate = (raw_obj.rate > 0 && raw_obj.rate <=10) ? String(obj.rate) : "5"; // rate should be in the interval ]0:10]
                                raw_obj.year = String(obj.year);
                                raw_obj.token = (obj[k][j].token) ? "1" : "0";
                                raw_obj.TokenUrl = (obj[k][j].token_url) ? obj[k][j].token_url : "";
                                raw_obj.encryption = (obj[k][j].encryption) ? "1" : "0";
                                raw_obj.encryption_url = (obj[k][j].encryption_url) ? obj[k][j].encryption_url : "";
                                raw_obj.isavailable = obj.isavailable;
                            });
                        }
                    });
                    raw_result.push(raw_obj);
                });

                if(result.length > 0) {
                    res.setHeader("etag", Date.now());
                }
                else {
                    res.setHeader("etag", tmptimestamp);
                }

                response.send_res_get(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');

            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
        }
        else{
            response.send_res_get(req, res, [], 200, 1, 'NO_DATA_FOUND', 'OK_DATA', 'private,max-age=86400');
        }
        return null;
    }).catch(function(error){
        res.jsonp(error);
    });
};


//RETURNS LIST OF VOD PROGRAMS VIA GET Request
/**
 * @api {post} /apiv2/vod/list /apiv2/vod/list
 * @apiVersion 0.2.0
 * @apiName GetVodList
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns video on demand assets/movies
 */
exports.list_get = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    var offset = (!req.params.pagenumber || req.params.pagenumber === '-1') ? 0 : ((parseInt(req.params.pagenumber)-1)*req.app.locals.settings.vod_subset_nr); //for older versions of vod, start query at first record
    var limit = (!req.params.pagenumber || req.params.pagenumber === '-1') ? 99999999999 : req.app.locals.settings.vod_subset_nr; //for older versions of vod, set limit to 99999999999


    models.vod.findAll({
        attributes: ['id', 'title', 'pin_protected', 'duration', 'description', 'director', 'starring', 'createdAt', 'rate', 'year', 'icon_url', 'image_url'],
        include: [
            {model: models.vod_stream, required: true, attributes: ['url', 'encryption', 'token', 'stream_format', 'token_url']},
            {model: models.vod_vod_categories, required: true, attributes: ['category_id'], where:{is_available: true},
                include: [{
                    model: models.vod_category, required: true, attributes: ['name'], where: {password:{in: allowed_content}, isavailable: true}
                }]
            },
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ],
        where: {pin_protected:{in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
        offset: offset,
        limit: limit,
        subQuery: false
    }).then(function (result) {
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};

            var category_list = "";
            for(var i=0; i<obj.vod_vod_categories.length; i++){
                if(category_list.length > 0) category_list += ", " + obj.vod_vod_categories[i].vod_category.name;
                else category_list += obj.vod_vod_categories[i].vod_category.name;
            }
            raw_obj.id = String(obj.id);
            raw_obj.title = obj.title;
            raw_obj.pin_protected = obj.pin_protected;
            raw_obj.duration = obj.duration;
            raw_obj.stream_format = obj.vod_streams[0].stream_format;
            raw_obj.url = obj.vod_streams[0].url;
            raw_obj.description = obj.description + '<p><strong>Director:</strong> ' + obj.director + '</p><p><strong>Starring:</strong> ' + obj.starring+'</p>';
            raw_obj.icon = req.app.locals.settings.assets_url+obj.icon_url;
            raw_obj.largeimage = req.app.locals.settings.assets_url+obj.image_url;
            raw_obj.categoryid = String(obj.vod_vod_categories[0].category_id);
            raw_obj.categories = category_list;
            raw_obj.dataadded = obj.createdAt.getTime();
            raw_obj.rate = (raw_obj.rate > 0 && raw_obj.rate <=10) ? String(obj.rate) : "5"; // rate should be in the interval ]0:10]
            raw_obj.year = String(obj.year);
            raw_obj.token = (obj.vod_streams[0].token) ? "1" : "0";
            raw_obj.TokenUrl = (obj.vod_streams[0].token_url) ? obj.vod_streams[0].token_url : "";
            raw_obj.encryption = (obj.vod_streams[0].encryption) ? "1" : "0";
            raw_obj.encryption_url = (obj.vod_streams[0].encryption_url) ? obj.vod_streams[0].encryption_url : "";
            raw_result.push(raw_obj);
        });
        response.send_res_get(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

//RETURNS LIST OF VOD PROGRAMS
/**
 * @api {post} /apiv2/vod/list /apiv2/vod/list
 * @apiVersion 0.2.0
 * @apiName GetVodList
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns video on demand assets/movies
 */
exports.list = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];
    var offset = (!req.body.subset_number || req.body.subset_number === '-1') ? 0 : ((parseInt(req.body.subset_number)-1)*req.app.locals.settings.vod_subset_nr); //for older versions of vod, start query at first record
    var limit = (!req.body.subset_number || req.body.subset_number === '-1') ? 99999999999 : req.app.locals.settings.vod_subset_nr; //for older versions of vod, set limit to 99999999999

    models.vod.findAll({
        attributes: ['id', 'title', 'pin_protected', 'duration', 'description', 'director', 'starring', 'createdAt', 'rate', 'year', 'icon_url', 'image_url'],
        include: [
            {model: models.vod_stream, required: true, attributes: ['url', 'encryption', 'token', 'stream_format', 'token_url']},
            {model: models.vod_vod_categories, required: true, attributes: ['category_id'], where: {is_available: true}, include: [{model: models.vod_category, attributes: ['name'], where: {isavailable: true} }]},
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ],
        where: {pin_protected:{in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
        offset: offset,
        limit: limit,
        subQuery: false
    }).then(function (result) {
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};

            Object.keys(obj.toJSON()).forEach(function(k) {
                if (typeof obj[k] == 'object') {
                    Object.keys(obj[k]).forEach(function(j) {
                        var category_list = "";
                        for(var i=0; i<obj.vod_vod_categories.length; i++){
                            if(category_list.length > 0) category_list += ", " + obj.vod_vod_categories[i].vod_category.name;
                            else category_list += obj.vod_vod_categories[i].vod_category.name;
                        }
                        raw_obj.id = String(obj.id);
                        raw_obj.title = obj.title;
                        raw_obj.pin_protected = obj.pin_protected;
                        raw_obj.duration = obj.duration;
                        raw_obj.stream_format = obj[k][j].stream_format;
                        raw_obj.url = obj[k][j].url;
                        raw_obj.description = obj.description + '<p><strong>Director:</strong> ' + obj.director + '</p><p><strong>Starring:</strong> ' + obj.starring+'</p>';
                        raw_obj.icon = req.app.locals.settings.assets_url+obj.icon_url;
                        raw_obj.largeimage = req.app.locals.settings.assets_url+obj.image_url;
                        raw_obj.categoryid = String(obj.vod_vod_categories[0].category_id);
                        raw_obj.categories = category_list;
                        raw_obj.dataadded = obj.createdAt.getTime();
                        raw_obj.rate = (raw_obj.rate > 0 && raw_obj.rate <=10) ? String(obj.rate) : "5"; // rate should be in the interval ]0:10]
                        raw_obj.year = String(obj.year);
                        raw_obj.token = (obj[k][j].token) ? "1" : "0";
                        raw_obj.TokenUrl = (obj[k][j].token_url) ? obj[k][j].token_url : "";
                        raw_obj.encryption = (obj[k][j].encryption) ? "1" : "0";
                        raw_obj.encryption_url = (obj[k][j].encryption_url) ? obj[k][j].encryption_url : "";
                    });
                }
            });
            raw_result.push(raw_obj);
        });
        response.send_partial_res(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

//RETURNS FULL LIST OF CATEGORIES
/**
 * @api {post} /apiv2/vod/categories /apiv2/vod/categories
 * @apiVersion 0.2.0
 * @apiName GetVodCategories
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns full list of categories
 */
exports.categories = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod_category.findAll({
        attributes: [ 'id', 'name', 'password', 'sorting', 'icon_url', 'small_icon_url'],
        include: [{
            model: models.vod_vod_categories, attributes: [], where: {is_available: true}, include: [
                {model: models.vod, attributes: [], required: true, where: {pin_protected:{in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
                    include: [
                        {model: models.vod_stream,  required: true, attributes: []},
                        {model: models.package_vod, required: true, attributes: [],
                            include: [{
                                model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                                include: [{
                                    model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                                }]
                            }]
                        }
                    ]
                }
            ]
        }],
        where: {password:{in: allowed_content}, isavailable: true}
    }).then(function (result) {
        var category_list = [];
        //type conversation of id from int to string. Setting static values
        for(var i=0; i< result.length; i++){
            var temp_list = {
                "id": result[i].id.toString(),
                "name": result[i].name,
                "password": (result[i].password) ? "True" : "False",
                "sorting": result[i].sorting,
                "IconUrl": req.app.locals.settings.assets_url+result[i].icon_url,
                "small_icon_url": req.app.locals.settings.assets_url+result[i].small_icon_url,
                "pay": "False"
            };
            category_list.push(temp_list);
        }
        response.send_res(req, res, category_list, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

//RETURNS FULL LIST OF CATEGORIES GET
/**
 * @api {post} /apiv2/vod/categories /apiv2/vod/categories
 * @apiVersion 0.2.0
 * @apiName GetVodCategories
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns full list of categories
 */
exports.categories_get = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod_category.findAll({
        attributes: [ 'id', 'name', 'password', 'sorting', 'icon_url', 'small_icon_url'],
        include: [{
            model: models.vod_vod_categories, attributes: [], where: {is_available: true}, include: [
                {model: models.vod, attributes: [], required: true, where: {pin_protected:{in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
                    include: [
                        {model: models.vod_stream,  required: true, attributes: []},
                        {model: models.package_vod, required: true, attributes: [],
                            include: [{
                                model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                                include: [{
                                    model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                                }]
                            }]
                        }
                    ]
                }
            ]
        }],
        where: {password:{in: allowed_content}, isavailable: true}
    }).then(function (result) {
        var category_list = [];
        //type conversation of id from int to string. Setting static values
        for(var i=0; i< result.length; i++){
            var temp_list = {
                "id": result[i].id.toString(),
                "name": result[i].name,
                "password": (result[i].password) ? "True" : "False",
                "sorting": result[i].sorting,
                "IconUrl": req.app.locals.settings.assets_url+result[i].icon_url,
                "small_icon_url": req.app.locals.settings.assets_url+result[i].small_icon_url,
                "pay": "False"
            };
            category_list.push(temp_list);
        }
        response.send_res_get(req, res, category_list, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res_get(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

//RETURNS ALL SUBTITLES FOR THE SELECTED PROGRAM
/**
 * @api {post} /apiv2/vod/subtitles /apiv2/vod/subtitles
 * @apiVersion 0.2.0
 * @apiName GetVodSubtitles
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns all subtitles list
 */
exports.subtitles = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod_subtitles.findAll({
        attributes: [ ['vod_id', 'vodid'], 'title', 'subtitle_url' ],
        include: [
            { model: models.vod, required: true, attributes: [], where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
                include: [
                    {model: models.vod_stream, required: true, attributes: []},
                    {model: models.vod_vod_categories, required: true, attributes: [], where:{is_available: true},
                        include: [{
                            model: models.vod_category, required: true, attributes: [], where: {password:{in: allowed_content}, isavailable: true}
                        }]
                    },
                    {model: models.package_vod, required: true, attributes: [],
                        include: [{
                            model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                            include: [{model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}}]
                        }]
                    }
                ]
            }
        ]
    }).then(function (result) {
        //type conversation of id from int to string
        var vod_subtitles = [];
        for(var i=0; i< result.length; i++){
            var temp_obj = {};
            temp_obj.vodid = String(result[i].toJSON().vodid);
            temp_obj.title = result[i].title;
            temp_obj.url = req.app.locals.settings.assets_url+result[i].subtitle_url;
            vod_subtitles.push(temp_obj)
        }
        response.send_res(req, res, vod_subtitles, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

exports.movie_subtitle = function(req, res) {

    models.vod_subtitles.findAll({
        attributes: [ ['vod_id', 'vodid'], 'title', [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('subtitle_url')), 'url'] ],
        where: {vod_id: req.body.vod_id}
    }).then(function (movie_sub) {
        for(var i=0; i< movie_sub.length; i++){
            movie_sub[i].toJSON().vodid = String(movie_sub[i].toJSON().vodid);
        }
        response.send_res(req, res, movie_sub, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};


//RETURNS ALL SUBTITLES FOR THE SELECTED PROGRAM GET METHOD
/**
 * @api {post} /apiv2/vod/subtitles /apiv2/vod/subtitles
 * @apiVersion 0.2.0
 * @apiName GetVodSubtitles
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns all subtitles list
 */
exports.subtitles_get = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod_subtitles.findAll({
        attributes: [ ['vod_id', 'vodid'], 'title', [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('subtitle_url')), 'url'] ],
        include: [
            { model: models.vod, required: true, attributes: [], where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
                include: [
                    {model: models.vod_stream, required: true, attributes: []},
                    {model: models.vod_vod_categories, required: true, attributes: [], where:{is_available: true},
                        include: [{
                            model: models.vod_category, required: true, attributes: [], where: {password:{in: allowed_content}, isavailable: true}
                        }]
                    },
                    {model: models.package_vod, required: true, attributes: [],
                        include: [{
                            model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                            include: [{model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}}]
                        }]
                    }
                ]
            }
        ]
    }).then(function (result) {
        //type conversation of id from int to string
        for(var i=0; i< result.length; i++){
            result[i].toJSON().vodid = String(result[i].toJSON().vodid);
        }
        response.send_res_get(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res_get(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};





//RETURNS CLICKS FOR THE SELECTED PROGRAM
/**
 * @api {post} /apiv2/vod/totalhits /apiv2/vod/totalhits
 * @apiVersion 0.2.0
 * @apiName GetVodItemHits
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiParam {Number} id_vod VOD item ID
 * @apiDescription Returns clicks/hits for selected vod item.
 */
exports.totalhits = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    //if hits for a specific movie are requested
    if(req.body.id_vod != "all"){
        models.vod.findAll({
            attributes: [ ['id', 'id_vod'], ['clicks', 'hits'] ],
            where: {id: req.body.id_vod, pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
            include: [
                {model: models.vod_stream, required: true, attributes: []},
                {model: models.vod_vod_categories, required: true, attributes: [], where:{is_available: true},
                    include: [{
                        model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}
                    }]
                }]
        }).then(function (result) {
            response.send_res(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
    }
    //return hits for each vod movie
    else{
        models.vod.findAll({
            attributes: [ ['id', 'id_vod'], ['clicks', 'hits'] ],
            where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
            include: [
                {model: models.vod_stream, required: true, attributes: []},
                {model: models.vod_vod_categories, required: true, attributes: [], where:{is_available: true},
                    include: [{
                        model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}
                    }]
                },
                {model: models.package_vod, required: true, attributes: [],
                    include: [{
                        model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                        include: [{
                            model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                        }]
                    }]
                }
            ]
        }).then(function (result) {
            response.send_res(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
    }

};

/**
 * @api {post} /apiv2/vod/mostwatched VodMostWatched
 * @apiVersion 0.2.0
 * @apiName VodMostWatched
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} auth Users unique access-key.
 * @apiDescription Returns most played movies.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 17,
 *       "clicks": 1567
 *      }, ...
 */
exports.mostwatched = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    //if hits for a specific movie are requested
    models.vod.findAll({
        attributes: ['id', 'clicks'],
        limit: 30, subQuery: false,
        order: [[ 'clicks', 'DESC' ]],
        where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_vod_categories, required: true, attributes: [], where: {is_available: true},
                include: [{model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}}, isavailable: true}]
            },
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ]
    }).then(function (result) {
        for(var i=0; i< result.length; i++){
            result[i].toJSON().id = String(result[i].toJSON().id);
        }
        response.send_res(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

/**
 * @api {get} /apiv2/vod/mostwatched VodMostWatchedGet
 * @apiVersion 0.2.0
 * @apiName VodMostWatchedGet
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns most played movies.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 17,
 *       "clicks": 1567
 *      }, ...
 */
exports.mostwatched_get = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    //if hits for a specific movie are requested
    models.vod.findAll({
        attributes: ['id', 'clicks'],
        limit: 30, subQuery: false,
        order: [[ 'clicks', 'DESC' ]],
        where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_vod_categories, required: true, attributes: [], where: {is_available: true},
                include: [{model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}}, isavailable: true}]
            },
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ]
    }).then(function (result) {
        for(var i=0; i< result.length; i++){
            result[i].toJSON().id = String(result[i].toJSON().id);
        }
        response.send_res_get(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res_get(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

exports.mostrated = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    //if most rated movies are requested
    models.vod.findAll({
        attributes: ['id', 'rate'], order: [[ 'rate', 'DESC' ]],
        where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
        limit: 30, subQuery: false,
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_vod_categories, required: true, attributes: [], where: {is_available: true},
                include: [{model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}}, isavailable: true}]
            },
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ]
    }).then(function (result) {
        var mostrated = [];

        for(var i=0; i< result.length; i++){
            var mostrated_object = {};
            mostrated_object.id = result[i].id;
            mostrated_object.rate = parseInt(result[i].rate);
            mostrated.push(mostrated_object);
        }

        response.send_res(req, res, mostrated, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

//most rated GET METHOD
exports.mostrated_get = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    //if most rated movies are requested
    models.vod.findAll({
        attributes: ['id', 'rate'], order: [[ 'rate', 'DESC' ]],
        where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
        limit: 30, subQuery: false,
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_vod_categories, required: true, attributes: [], where: {is_available: true},
                include: [{model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}}, isavailable: true}]
            },
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ]
    }).then(function (result) {
        var mostrated = [];
        for(var i=0; i< result.length; i++){
            var mostrated_object = {};
            mostrated_object.id = result[i].id;
            mostrated_object.rate = parseInt(result[i].rate);
            mostrated.push(mostrated_object);
        }
        response.send_res_get(req, res, mostrated, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res_get(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

exports.related = function(req, res) {

    models.vod.findAll({
        attributes: [/*'category_id',*/ 'director', 'starring'], where: {id: req.body.vod_id},
        limit: 1
    }).then(function (result) {
        var director_list = result[0].director.split(',');
        var director_matching_score = "";
        for(var i=0; i<director_list.length; i++){
            if(i === director_list.length-1) director_matching_score = director_matching_score+" IF( ( director like '%"+director_list[i].trim()+"%' ), 0.5, 0)";
            else director_matching_score = director_matching_score+" IF( ( director like '%"+director_list[i].trim()+"%' ), 0.5, 0) + "
        }

        var actor_list = result[0].starring.split(',');
        var actor_matching_score = "";
        for(var i=0; i<actor_list.length; i++){
            if(i === actor_list.length-1) actor_matching_score = actor_matching_score+" IF( ( starring like '%"+actor_list[i].trim()+"%' ), 0.3, 0)";
            else actor_matching_score = actor_matching_score+" IF( ( starring like '%"+actor_list[i].trim()+"%' ), 0.3, 0) + "
        }

        var where_condition =  " vod.id <> "+req.body.vod_id+" AND isavailable = true AND vod_stream.stream_source_id = "+req.thisuser.vod_stream_source+" AND expiration_time > NOW() ";
        if(req.thisuser.show_adult === true) where_condition = where_condition + " AND pin_protected = false ";
        where_condition += " AND subscription.login_id = "+req.thisuser.id+" and subscription.end_date > NOW() AND package.package_type_id = "+ Number(req.auth_obj.screensize + 2) +" ";

        var related_query = "SELECT DISTINCT vod.id, "+
            " ( "+
                //" IF( (category_id = "+result[0].category_id+"), 1, 0) + "+ //category matching score
            " ( "+director_matching_score+" ) + "+ //director matching score
            " ( "+actor_matching_score+" ) "+ //actor matching score
            " ) AS matching_score "+
            " FROM vod "+
            " INNER JOIN vod_stream ON vod.id = vod_stream.vod_id "+
            " INNER JOIN package_vod ON vod.id = package_vod.vod_id INNER JOIN package ON package.id = package_vod.package_id INNER JOIN subscription ON subscription.package_id = package.id   "+
            " WHERE "+ where_condition+
            " ORDER BY matching_score DESC " +
            " LIMIT 5 "+
            ";";

        sequelizes.sequelize.query(
            related_query
        ).then(function(related_result){
            if (!related_result || !related_result[0]) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'NO DATA FOUND', 'no-store');
            } else {
                var response_data = [];
                for(var i=0; i< related_result[0].length; i++){
                    response_data[i] = {"id": related_result[0][i].id.toString()};
                }
                response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
            }
        }).catch(function(error){
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};


exports.suggestions = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id'],
        where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {
                model: models.vod_vod_categories, required: true, attributes: [], where: {is_available: true},
                include: [{
                    model: models.vod_category, required: true, attributes: [], where: {password: {in: allowed_content}, isavailable: true}
                }]
            },
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ],
        limit: 10, subQuery: false
    }).then(function (result) {
        response.send_res(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

//sugesstions GET METHOD
exports.suggestions_get = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id'],
        where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {
                model: models.vod_vod_categories, required: true, attributes: [], where: {is_available: true},
                include: [{
                    model: models.vod_category, required: true, attributes: [], where: {password: {in: allowed_content}, isavailable: true}
                }]
            },
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ],
        limit: 10, subQuery: false
    }).then(function (result) {
        response.send_res_get(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res_get(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

exports.categoryfilms = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id'],
        where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_vod_categories, required: true, attributes: [], where: {category_id: req.body.category_id, is_available: true},
                include: [{model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}}, isavailable: true}]
            },
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ]
    }).then(function (result) {
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};
            raw_obj.id = String(obj.id);
            raw_result.push(raw_obj);
        });
        response.send_res(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

//category GET METHOD
exports.categoryfilms_get = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id'],
        where: {pin_protected: {in: allowed_content}, isavailable: true, expiration_time: {$gte: Date.now()}},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_vod_categories, required: true, attributes: [], where: {category_id: req.query.category_id, is_available: true},
                include: [{model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}}, isavailable: true}]
            },
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ]
    }).then(function (result) {
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};
            raw_obj.id = String(obj.id);
            raw_result.push(raw_obj);
        });
        response.send_res(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

//get single vod item data
exports.get_vod_item = function(req, res) {
    var vodID = req.params.vodID;
    models.vod.find({
        where: {
            id: vodID,
            expiration_time: {$gte: Date.now()}
        },
        include: [{model: models.vod_subtitles},
            {model: models.vod_vod_categories, required: true, attributes: ['category_id'], where: {is_available: true}},
            {model: models.vod_stream, where:{stream_source_id: req.thisuser.vod_stream_source}}],

    }).then(function(result) {
        if (!result) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'NO DATA FOUND', 'no-store');
        } else {
            var raw_obj = [];
            raw_obj[0] = {};

            raw_obj[0].id=result.id;
            raw_obj[0].title=result.title;
            raw_obj[0].duration =result.duration;
            raw_obj[0].pin_protected = result.pin_protected;
            raw_obj[0].vod_subtitles = result.vod_subtitles;

            raw_obj[0].stream_format = result.vod_streams[0].stream_format;
            raw_obj[0].url = result.vod_streams[0].url;
            raw_obj[0].description = result.description + '<p><strong>Director:</strong> ' + result.director + '</p><p><strong>Starring:</strong> ' + result.starring+'</p>';
            raw_obj[0].icon_url = req.app.locals.settings.assets_url+result.icon_url;
            raw_obj[0].image_url = req.app.locals.settings.assets_url+result.image_url;
            raw_obj[0].categoryid = String(result.vod_vod_categories[0].category_id);
            //raw_obj.dataadded = obj.createdAt.getTime();
            raw_obj[0].rate = (result.rate > 0 && result.rate <=10) ? String(result.rate) : "5"; // rate should be in the interval ]0:10]
            raw_obj[0].year = String(result.year);
            raw_obj[0].token = (result.vod_streams[0].token) ? "1" : "0";
            raw_obj[0].TokenUrl = result.vod_streams[0].token_url;
            raw_obj[0].encryption = (result.vod_streams[0].encryption) ? "1" : "0";
            raw_obj[0].encryption_url = result.vod_streams[0].encryption_url;

            response.send_res_get(req, res, raw_obj, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');

        }
    }).catch(function(err) {
        console.log(err);
    });

};

//get this vod item related movies.
exports.get_vod_item_related = function(req, res) {

    models.vod.findAll({
        attributes: [/*'category_id',*/ 'director', 'starring'], where: {id: req.params.vodID},
        limit: 1
    }).then(function (result) {
        var director_list = result[0].director.split(',');
        var director_matching_score = "";
        for(var i=0; i<director_list.length; i++){
            if(i === director_list.length-1) director_matching_score = director_matching_score+" IF( ( director like '%"+director_list[i].trim()+"%' ), 0.5, 0)";
            else director_matching_score = director_matching_score+" IF( ( director like '%"+director_list[i].trim()+"%' ), 0.5, 0) + "
        }

        var actor_list = result[0].starring.split(',');
        var actor_matching_score = "";
        for(var i=0; i<actor_list.length; i++){
            if(i === actor_list.length-1) actor_matching_score = actor_matching_score+" IF( ( starring like '%"+actor_list[i].trim()+"%' ), 0.3, 0)";
            else actor_matching_score = actor_matching_score+" IF( ( starring like '%"+actor_list[i].trim()+"%' ), 0.3, 0) + "
        }

        var where_condition =  " vod.id <> "+req.params.vodID+" AND vod.isavailable = true AND vod_stream.stream_source_id = "+req.thisuser.vod_stream_source+" AND expiration_time > NOW() ";
        if(req.thisuser.show_adult === true) where_condition = where_condition + " AND pin_protected = false ";
        where_condition += " AND subscription.login_id = "+req.thisuser.id+" and subscription.end_date > NOW() AND package.package_type_id = "+ Number(req.auth_obj.screensize + 2) +" ";

        var offset = isNaN(parseInt(req.query._start)) ? 0 : parseInt(req.query._start);
        var limit =  isNaN(parseInt(req.query._end)) ?  req.app.locals.settings.vod_subset_nr: parseInt(req.query._end) - offset;
        var order_by = (req.query._orderBy) ? req.query._orderBy + ' ' + req.query._orderDir : "matching_score DESC";
        var related_query = "SELECT DISTINCT CAST(vod.id AS CHAR) AS id, vod.title, CONCAT(vod.description, ' Director: ', vod.director, ' Starring: ', vod.starring) AS description, vod.rate, vod.duration, " +
            "vod.pin_protected, vod.year, UNIX_TIMESTAMP(vod.createdAt) as dataadded, CONCAT('"+req.app.locals.settings.assets_url+"', vod.icon_url) AS icon, "+
            " concat('"+req.app.locals.settings.assets_url + "', vod.image_url) as largeimage,"+
            " ( "+
                //" IF( (category_id = "+result[0].category_id+"), 1, 0) + "+ //category matching score
            " ( "+director_matching_score+" ) + "+ //director matching score
            " ( "+actor_matching_score+" ) "+ //actor matching score
            " ) AS matching_score "+
            " , GROUP_CONCAT(DISTINCT vod_category.name SEPARATOR ', ') as categories, vod_vod_categories.category_id as categoryid "+
            " FROM vod "+
            " INNER JOIN vod_vod_categories ON vod.id = vod_vod_categories.vod_id INNER JOIN vod_category ON vod_vod_categories.category_id = vod_category.id "+
            " INNER JOIN vod_stream ON vod.id = vod_stream.vod_id "+
            " INNER JOIN package_vod ON vod.id = package_vod.vod_id INNER JOIN package ON package.id = package_vod.package_id INNER JOIN subscription ON subscription.package_id = package.id   "+
            " WHERE "+ where_condition+
            " GROUP BY vod.id "+
            " ORDER BY "+order_by+" " +
            " LIMIT "+offset+", "+limit+" "+
            ";";

        sequelizes.sequelize.query(
            related_query
        ).then(function(related_result){
            if (!related_result || !related_result[0]) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'NO DATA FOUND', 'no-store');
            } else {
                res.setHeader("X-Total-Count", related_result[0].length);
                response.send_res_get(req, res, related_result[0], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
            }
        }).catch(function(error){
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

//get this vod item related movies.
exports.get_vod_items_recommended = function(req, res) {
    //find the user's active vod packages
    models.subscription.findAll({
        attributes: ['package_id'], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}, group: ['package_id'],
        include: [{
            model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 }, include: [{
                model: models.package_vod, required: true, attributes: []
            }]
        }],
        raw: true
    }).then(function(result){
        if(result && result.length > 0){
            var package_list = [];
            for(var i=0; i<result.length; i++){
                package_list.push(result[i].package_id); //list of packages into array
            }
            var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];
            var query = req.query;
            var qwhere  = {};
            qwhere.where = {};

            qwhere.attributes = ['id', 'title', 'description', 'starring', 'director', 'rate', 'duration', 'year', 'pin_protected', 'clicks',
                [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('icon_url')), 'icon_url'],
                [db.sequelize.fn('concat', req.app.locals.settings.assets_url, db.sequelize.col('image_url')), 'image_url'],
                [db.sequelize.fn('UNIX_TIMESTAMP', db.sequelize.col('createdAt')), 'createdAt']
            ];
            qwhere.where.pin_protected = 0;
            qwhere.where.isavailable = 1;
            qwhere.offset = isNaN(parseInt(query._start)) ? 0:parseInt(query._start);
            qwhere.limit =  isNaN(parseInt(query._end)) ?  req.app.locals.settings.vod_subset_nr: parseInt(query._end) - qwhere.offset;
            qwhere.where.expiration_time = {$gte: Date.now()};

            if(query._orderBy) qwhere.order = query._orderBy + ' ' + query._orderDir;
            qwhere.include = [
                {model: models.vod_stream, required: true, attributes: [], where: {stream_source_id: req.thisuser.vod_stream_source}},
                {model: models.vod_vod_categories, required: true, attributes: ['id', 'category_id'], where: {is_available: true}, include: [{model: models.vod_category, attributes: ['name']}]},
                {model: models.package_vod, required: true, attributes: [], where: {package_id: {in: package_list}}}
            ]; //exclude films without streams or from other stream sources

            models.vod.findAndCountAll(
                qwhere
            ).then(function(results) {
                var vod_list = [];
                async.forEach(results.rows, function(vod_film, callback){
                    var category_list = "";
                    for(var i=0; i<vod_film.vod_vod_categories.length; i++){
                        if(category_list.length > 0) category_list += ", " + vod_film.vod_vod_categories[i].vod_category.name;
                        else category_list += vod_film.vod_vod_categories[i].vod_category.name;
                    }
                    var vod_item = {
                        "id": vod_film.id,
                        "title": vod_film.title,
                        "pin_protected": vod_film.pin_protected,
                        "rate": vod_film.rate,
                        "duration": vod_film.duration,
                        "year": vod_film.year,
                        "categoryid": vod_film.vod_vod_categories[0].category_id,
                        "categories": category_list,
                        "description": vod_film.description + ' <p><strong>Director:</strong> ' + vod_film.director + '</p><p><strong>Starring:</strong> ' + vod_film.starring+'</p>',
                        "icon": vod_film.icon_url,
                        "largeimage": vod_film.image_url,
                        "dataadded": vod_film.createdAt
                    };
                    vod_list.push(vod_item);
                    callback(null);
                },function(error, result){
                    res.setHeader("X-Total-Count", vod_list.length);
                    response.send_res_get(req, res, vod_list, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
                });
            }).catch(function(err) {
                res.jsonp(err);
            });
        }
        else{
            response.send_res_get(req, res, [], 200, 1, 'NO_DATA_FOUND', 'OK_DATA', 'private,max-age=86400');
        }
        return null;
    }).catch(function(error){
        res.jsonp(error);
    });
};

//vod list api for live data



/**
 * @api {get} /apiv2/vod/vodlist GET VOD Items
 * @apiName GetVodList
 * @apiGroup VOD
 *
 * @apiHeader {String[]} auth Device AUTH token plus device params separated by coma ex: auth=123,mac=abcde1234
 *
 * @apiParam {String} [q]  Query string
 * @apiParam {String} [vod_type]  Query string, comma delimited, optional. If missing, return all vod types. Value set [film, tv_series]
 * @apiParam {Number} [pin_protected]  If 1, query will include pin protected items
 * @apiParam {Number} [category] Filter records to this category id
 * @apiParam {Number} [_start] Record pointer start
 * @apiParam {Number} [_end] Limit number of records
 * @apiParam {Number} [_end] Limit number of records
 * @apiParam {String} [_orderBy] Database field name to order records.
 * @apiParam {String} [_orderDir] (ASC or DESC) Sorting directions.
 *
 *@apiDescription Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */

exports.get_vod_list = function(req, res) {

    //find the user's active vod packages
    models.subscription.findAll({
        attributes: ['package_id'], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}, group: ['package_id'],
        include: [{
            model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 }, include: [{
                model: models.package_vod, required: true, attributes: []
            }]
        }],
        raw: true
    }).then(function(result){
        if(result && result.length > 0){
            var package_list = [];
            for(var i=0; i<result.length; i++){
                package_list.push(result[i].package_id); //list of packages into array
            }
            //preparing the query params for the vod item list
            var allowed_content = ((req.thisuser.show_adult === true ) && (req.query.pin_protected === '1')) ? [0, 1] : [0];
            //var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];
            //var allowed_content = [0,1];

            var qwhere = {},
                final_where = {},
                query = req.query;
            final_where.include = [];

            if(query.q) {
                qwhere.$or = {};
                qwhere.$or.title = {};
                qwhere.$or.title.$like = '%'+query.q+'%';
                qwhere.$or.description = {};
                qwhere.$or.description.$like = '%'+query.q+'%';
                qwhere.$or.director = {};
                qwhere.$or.director.$like = '%'+query.q+'%';
            }

            qwhere.vod_type = (query.vod_type) ? {$in: query.vod_type.split(',')} : {$in: ['film', 'tv_series']}; //if specified, return only required vod type
            qwhere.isavailable = true;
            qwhere.pin_protected = {in: allowed_content};

            var category_where = (req.query.category) ? {is_available: true, category_id: req.query.category} : {is_available: true};

            //filter films added in the following time interval
            if(query.added_before && query.added_after) qwhere.createdAt = {lt: query.added_before, gt: query.added_after};
            else if(query.added_before) qwhere.createdAt = {lt: query.added_before};
            else if(query.added_after) qwhere.createdAt = {gt: query.added_after};

            //filter films updated in the following time interval
            if(query.updated_before && query.updated_after) qwhere.createdAt = {lt: query.updated_before, gt: query.updated_after};
            else if(query.updated_before) qwhere.updatedAt = {lt: query.updated_before};
            else if(query.updated_after) qwhere.updatedAt = {gt: query.updated_after};

            //start building where

            final_where.attributes = ['id', 'vod_type', 'title', 'pin_protected',  'rate', 'duration', 'year', 'clicks',
                [
                    db.sequelize.fn('concat', db.sequelize.col('description'), '<p><strong>Director:</strong> ', db.sequelize.col('director'),
                        '</p><p><strong>Starring:</strong> ', db.sequelize.col('starring'), '</p>'), 'description'
                ],
                [db.sequelize.fn('concat', req.app.locals.settings.assets_url, db.sequelize.col('icon_url')), 'icon_url'],
                [db.sequelize.fn('concat', req.app.locals.settings.assets_url, db.sequelize.col('image_url')), 'image_url'],
                [db.sequelize.fn('UNIX_TIMESTAMP', db.sequelize.col('createdAt')), 'createdAt']
            ];

            qwhere.expiration_time = {$gte: Date.now()};

            final_where.where = qwhere;

            //if(parseInt(query._end) !== -1){
            final_where.offset = isNaN(parseInt(query._start)) ? 0:parseInt(query._start);
            final_where.limit =  isNaN(parseInt(query._end)) ?  req.app.locals.settings.vod_subset_nr: parseInt(query._end) - final_where.offset;
            //}

            final_where.include = [
                {model: models.vod_stream, required: false, attributes: ['id'], where: {stream_source_id: req.thisuser.vod_stream_source}}, //u be non required, per tv series
                {model: models.vod_vod_categories, as: 'vod_vod_category', required: true, attributes: [], where: category_where}, //join only vod items that belong to specific category
                {model: models.vod_vod_categories, required: false, attributes: ['category_id'], where: {is_available: true}, include: [{model: models.vod_category, attributes: ['name']}]},
                {model: models.package_vod, required: true, attributes: [], where: {package_id: {in: package_list}}}
            ];

            if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
            //end build final where

            models.vod.findAndCountAll(
                final_where
            ).then(function(results) {
                var vod_list = [];
                async.forEach(results.rows, function(vod_film, callback){
                    if(vod_film.vod_streams.length > 0 || vod_film.vod_type === "tv_series"){ //todo: ndoshta kerko per stream id?
                        var filter_out_by_category = true;
                        var category_name_list = "";
                        async.forEach(vod_film.vod_vod_categories, function(vod_category_obj, callback){
                            category_name_list = (category_name_list.length === 0) ? (category_name_list + vod_category_obj.vod_category.name) : (category_name_list + ", " + vod_category_obj.vod_category.name);
                            callback(null);
                        },function(error, result){
                            var vod_item = {
                                "id": vod_film.id,
                                "title": vod_film.title,
                                "pin_protected": vod_film.pin_protected,
                                "rate": vod_film.rate,
                                "duration": vod_film.duration,
                                "year": vod_film.year,
                                "category_id": vod_film.vod_vod_categories[0].category_id,
                                "categories": category_name_list,
                                "description": vod_film.description,
                                "icon": vod_film.icon_url,
                                "vod_type": vod_film.vod_type,
                                "largeimage": vod_film.image_url,
                                "dataadded": vod_film.createdAt
                            };
                            vod_list.push(vod_item);
                        });
                    }
                    callback(null);
                },function(error, result){
                    res.setHeader("X-Total-Count", vod_list.length);
                    response.send_res_get(req, res, vod_list, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
                });
            }).catch(function(err) {
                res.jsonp(err);
            });

        }
        else{
            response.send_res_get(req, res, [], 200, 1, 'NO_DATA_FOUND', 'OK_DATA', 'private,max-age=86400');
        }
        return null;
    }).catch(function(error){
        res.jsonp(error);
    });
};


exports.searchvod = function(req, res) {
    //var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];
    var allowed_content = ((req.thisuser.show_adult === true) && (req.query.pin_protected === 1)) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id', 'title'],
        include: [
            {model: models.vod_stream, required: true, attributes: ['url', 'encryption']},
            {model: models.vod_vod_categories, required: true, attributes: [], where:{is_available: true},
                include: [{
                    model: models.vod_category, required: true, attributes: [], where: {password:{in: allowed_content}, isavailable: true}
                }]
            },
            {model: models.package_vod, required: true, attributes: [],
                include: [{
                    model: models.package, required: true, attributes: [], where: {package_type_id: req.auth_obj.screensize + 2 },
                    include: [{
                        model: models.subscription, required: true, attributes: [], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                    }]
                }]
            }
        ],
        where: {pin_protected:{in: allowed_content}, isavailable: true, title: {like: '%'+req.body.search_string+'%'}, expiration_time: {$gte: Date.now()}}
    }).then(function (result) {
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};
            Object.keys(obj.toJSON()).forEach(function(k) {
                if (typeof obj[k] == 'object') {
                    Object.keys(obj[k]).forEach(function(j) {
                        raw_obj.id = String(obj.id);
                        raw_obj.title = obj.title;
                    });
                }
            });
            raw_result.push(raw_obj);
        });
        response.send_res(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

exports.resume_movie = function(req, res) {
    //perdor upsert qe nje user te kete vetem 1 film. nese nuk ka asnje te shtohet, ne te kundert te ndryshohet
    models.vod_resume.upsert(
        {
            login_id: req.thisuser.id,
            vod_id: req.body.vod_id,
            resume_position: req.body.resume_position,
            device_id: req.auth_obj.boxid
        }
    ).then(function (result) {
        response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        if (error.message.split(': ')[0] === 'ER_NO_REFERENCED_ROW_2'){
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'INVALID_INPUT', 'no-store');
        }
        else response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

/**
 * @api {get} /apiv2/vod/vod_details/[vod_id] GET VOD item details
 * @apiName GetVodDetails
 * @apiGroup VOD
 *
 * @apiHeader {String[]} auth Device AUTH token plus device params separated by coma ex: auth=123,mac=abcde1234 *
 *
 * @apiDescription Copy paste this auth for testing purposes
 * auth=/ihCuMthnmY7pV3WLgC68i70zwLp6DUrLyFe9dOUEkxUBFH9WrUcA95GFAecSJH9HG9tvymreMOFlBviVd3IcII4Z/SiurlGoz9AMtE5KGFZvCl1FQ3FKZYP3LeFgzVs\r\nDQjxaup3sKRljj4lmKUDTA==
 *
 */


exports.get_movie_details = function(req, res) {
    models.vod.findOne({
        attributes: ['id', 'trailer_url', 'vod_preview_url', 'default_subtitle_id'],
        include: [
            {model: models.vod_stream, attributes: ['stream_format', 'url', 'token', 'token_url', 'encryption', 'encryption_url'], where: {stream_source_id: req.thisuser.vod_stream_source}},
            {model: models.vod_subtitles, attributes: ['id', 'title', [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('subtitle_url')), 'url'], ['vod_id', 'vodid']]}
        ],
        where: {id: req.params.vod_id}
    }).then(function (result) {
        var vod_data = {};
        if(result){
            var found = "";
            if(result.vod_subtitles){
                try{
                    found = result.vod_subtitles.find(function(x){
                        if(x.id === (result.default_subtitle_id)){
                            return x.title;
                        }
                    }).title;
                }
                catch(error){
                    found = "";
                }
            }

            vod_data.stream_format = (result.vod_streams[0] && result.vod_streams[0].stream_format) ? result.vod_streams[0].stream_format : "0";
            vod_data.stream_url = (result.vod_streams[0] && result.vod_streams[0].url) ? result.vod_streams[0].url : ""; //url e streamit
            vod_data.trailer_url = (result.vod_streams[0] && result.vod_streams[0].url) ? result.trailer_url : "";
            vod_data.vod_preview_url = (result.vod_streams[0] && result.vod_streams[0].url) ? result.vod_preview_url : "";
            vod_data.drm_platform = (result.vod_streams[0] && result.vod_streams[0].drm_platform) ? result.drm_platform : "none";
            vod_data.token =  (result.vod_streams[0] && result.vod_streams[0].token) ? "1" : "0";
            vod_data.TokenUrl = (result.vod_streams[0] && result.vod_streams[0].token_url) ? result.vod_streams[0].token_url : "";
            vod_data.encryption = (result.vod_streams[0] && result.vod_streams[0].encryption) ? "1" : "0";
            vod_data.encryption_url = (result.vod_streams[0] && result.vod_streams[0].encryption_url) ? result.vod_streams[0].encryption_url : "";
            vod_data.default_language = found;
            vod_data.subtitles = (result.vod_subtitles.length > 0) ? result.vod_subtitles : [{}];
        }
        response.send_res_get(req, res, [vod_data], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};



/**
 * @api {get} /apiv2/vod/get_tv_series_data GET list of seasons and episodes of a tv show
 * @apiName GetTvShowData
 * @apiGroup VOD
 *
 * @apiHeader {String[]} auth Device AUTH token plus device params separated by coma ex: auth=123,mac=abcde1234
 *
 * @apiParam {Number} [vod_id]  Query string, id of the tv show
 * @apiParam {Number} [season_number]  Query string, optional, specifies season number of the episodes that should be listed. Default value is 1.
 *
 *@apiDescription Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
exports.get_tv_series_data = function(req, res){

    if(!req.query.season_number) req.query.season_number = 1;
    models.vod.findOne({
        attributes: ['id'], where: {season_number: req.query.season_number, vod_parent_id: req.query.vod_id}
    }).then(function (season_id) {
        models.vod.findAll({
            attributes: ['id', 'title'],
            include: [
                {
                    model: models.vod , as: 'seasons', attributes: ['id', 'title', 'season_number'], required: false,
                    include: [{
                        model: models.vod , as: 'episodes', attributes: [
                            'id', 'title', 'pin_protected', 'rate', 'duration', 'year',
                            [
                                db.sequelize.fn('concat', db.sequelize.col('seasons.episodes.description'), '<p><strong>Director:</strong> ', db.sequelize.col('seasons.episodes.director'),
                                    '</p><p><strong>Starring:</strong> ', db.sequelize.col('seasons.episodes.starring'), '</p>'), 'description'
                            ],
                            [db.sequelize.fn('concat', req.app.locals.settings.assets_url, db.sequelize.col('seasons.episodes.icon_url')), 'icon'],
                            [db.sequelize.fn('concat', req.app.locals.settings.assets_url, db.sequelize.col('seasons.episodes.image_url')), 'largeimage'],
                            [db.sequelize.fn('UNIX_TIMESTAMP', db.sequelize.col('seasons.episodes.createdAt')), 'dataadded']
                        ],
                        required: false,
                        where: {vod_parent_id: season_id.id}
                    }]
                }
            ],
            where: {id: req.query.vod_id},
            logging: console.log
        }).then(function (vod_result) {
            response.send_res_get(req, res, vod_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
        }).catch(function (error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function (error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

function delete_resume_movie(user_id, vod_id){

    //perdor upsert qe nje user te kete vetem 1 film. nese nuk ka asnje te shtohet, ne te kundert te ndryshohet
    models.vod_resume.destroy(
        {
            where: {
                login_id: user_id,
                vod_id: vod_id
            }
        }
    ).then(function (result) {
        return null;
    }).catch(function(error) {
        return null;
    });

};

function add_click(movie_title){
    models.vod.findOne({
        attributes: ['id', 'clicks'],
        where: {title: movie_title}
    }).then(function (result) {
        models.vod.update(
            {clicks: result.clicks + 1},
            {where: {id: result.id}}
        ).then(function (result) {
            return null;
        }).catch(function(error) {
            return null;
        });
        return null;
    }).catch(function(error) {
        return null;
    });
};

exports.delete_resume_movie = delete_resume_movie;
exports.add_click = add_click;



