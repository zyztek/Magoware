'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    sequelize = require('sequelize'),
    response = require(path.resolve("./config/responses.js")),
    crypto = require('crypto'),
    models = db.models;

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
        attributes: ['id', 'title', 'pin_protected', 'duration', 'description', 'director', 'starring', 'category_id', 'createdAt', 'rate', 'year', 'icon_url', 'image_url'],
        include: [
            {model: models.vod_stream, required: true, attributes: ['url', 'encryption', 'token', 'stream_format', 'token_url']},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ],
        where: {pin_protected:{in: allowed_content}, isavailable: true},
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
                        raw_obj.id = String(obj.id);
                        raw_obj.title = obj.title;
                        raw_obj.pin_protected = (obj.pin_protected === true) ? 1 : 0;
                        raw_obj.duration = obj.duration;
                        raw_obj.stream_format = obj[k][j].stream_format;
                        raw_obj.url = obj[k][j].url;
                        raw_obj.description = obj.description + ' Director: ' + obj.director + ' Starring: ' + obj.starring;
                        raw_obj.icon = req.app.locals.settings.assets_url+obj.icon_url;
                        raw_obj.largeimage = req.app.locals.settings.assets_url+obj.image_url;
                        raw_obj.categoryid = String(obj.category_id);
                        raw_obj.dataaded = obj.createdAt.getTime();
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
        response.send_res_get(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        //res.send(error);
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
        attributes: ['id', 'title', 'pin_protected', 'duration', 'description', 'director', 'starring', 'category_id', 'createdAt', 'rate', 'year', 'icon_url', 'image_url'],
        include: [
            {model: models.vod_stream, required: true, attributes: ['url', 'encryption', 'token', 'stream_format', 'token_url']},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ],
        where: {pin_protected:{in: allowed_content}, isavailable: true},
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
                        raw_obj.id = String(obj.id);
                        raw_obj.title = obj.title;
                        raw_obj.pin_protected = (obj.pin_protected === true) ? 1 : 0;
                        raw_obj.duration = obj.duration;
                        raw_obj.stream_format = obj[k][j].stream_format;
                        raw_obj.url = obj[k][j].url;
                        raw_obj.description = obj.description + ' Director: ' + obj.director + ' Starring: ' + obj.starring;
                        raw_obj.icon = req.app.locals.settings.assets_url+obj.icon_url;
                        raw_obj.largeimage = req.app.locals.settings.assets_url+obj.image_url;
                        raw_obj.categoryid = String(obj.category_id);
                        raw_obj.dataaded = obj.createdAt.getTime();
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
        attributes: [ 'id', 'name', 'password', 'sorting', [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('icon_url')), 'IconUrl'],
            [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('small_icon_url')), 'small_icon_url']],
        where: {password:{in: allowed_content}, isavailable: true}
    }).then(function (result) {
        //type conversation of id from int to string. Setting static values
        for(var i=0; i< result.length; i++){
            result[i].toJSON().id = String(result[i].toJSON().id);
            result[i].toJSON().password = "False";
            result[i].toJSON().pay = "False";
        }
        response.send_res(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
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
    var allowed_content = [0,1]; //(req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod_category.findAll({
        attributes: [ 'id', 'name', 'password', 'sorting', [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('icon_url')), 'IconUrl'],
            [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('small_icon_url')), 'small_icon_url']],
        where: {password:{in: allowed_content}, isavailable: true}
    }).then(function (result) {
        //type conversation of id from int to string. Setting static values
        for(var i=0; i< result.length; i++){
            result[i].toJSON().id = String(result[i].toJSON().id);
            result[i].toJSON().password = "False";
            result[i].toJSON().pay = "False";
        }
        response.send_res_get(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
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
        attributes: [ ['vod_id', 'vodid'], 'title', [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('subtitle_url')), 'url'] ],
        include: [
            { model: models.vod, required: true, attributes: [], where: {pin_protected: {in: allowed_content}, isavailable: true},
                include: [
                    {model: models.vod_stream, required: true, attributes: []},
                    {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
                ]
            }
        ]
    }).then(function (result) {
        //type conversation of id from int to string
        for(var i=0; i< result.length; i++){
            result[i].toJSON().vodid = String(result[i].toJSON().vodid);
        }
        response.send_res(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
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
            { model: models.vod, required: true, attributes: [], where: {pin_protected: {in: allowed_content}, isavailable: true},
                include: [
                    {model: models.vod_stream, required: true, attributes: []},
                    {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
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
            where: {id: req.body.id_vod, pin_protected: {in: allowed_content}, isavailable: true},
            include: [
                {model: models.vod_stream, required: true, attributes: []},
                {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
            ]
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
            where: {pin_protected: {in: allowed_content}, isavailable: true},
            include: [
                {model: models.vod_stream, required: true, attributes: []},
                {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
            ]
        }).then(function (result) {
            response.send_res(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
    }

};

exports.mostwatched = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    //if hits for a specific movie are requested
    models.vod.findAll({
        attributes: ['id', 'clicks'],
        limit: 30,
        order: [[ 'clicks', 'DESC' ]],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
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

//MOST WATCHED GET METHOD
exports.mostwatched_get = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    //if hits for a specific movie are requested
    models.vod.findAll({
        attributes: ['id', 'clicks'],
        limit: 30,
        order: [[ 'clicks', 'DESC' ]],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
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
        attributes: ['id', 'rate'],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        limit: 30,
        order: [[ 'rate', 'DESC' ]],
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
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
        attributes: ['id', 'rate'],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        limit: 30,
        order: [[ 'rate', 'DESC' ]],
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
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
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];
    var now = Date.now();

    models.vod.findAll({
        attributes: ['id'],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ],
        order: [
            [sequelize.fn('RAND', sequelize.literal(now))]
        ],
        limit: 5
    }).then(function (result) {
        for(var i=0; i< result.length; i++){
            result[i].toJSON().id = String(result[i].toJSON().id);
        }
        response.send_res(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

exports.suggestions = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id'],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ],
        limit: 10
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
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ],
        limit: 10
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
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true, id: req.body.category_id}}
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
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true, id: req.body.category_id}}
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
            id: vodID
        },
        include: [{model: models.vod_category}, {model: models.package},{model: models.vod_subtitles},{model: models.vod_stream}]
    }).then(function(result) {
        if (!result) {
            //return res.status(404).send({
            //    message: 'No data with that identifier has been found'
            //});
            res.send('error');
        } else {
            //req.vod = result;
            //next();
            //return null;
            res.send(result);
        }
    }).catch(function(err) {
        console.log(err);
    });

};

exports.get_vod_list = function(req, res) {
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

    if(query.category) qwhere.category_id = query.category;

    //filter films added in the following time interval
    if(query.added_before && query.added_after) qwhere.createdAt = {lt: query.added_before, gt: query.added_after};
    else if(query.added_before) qwhere.createdAt = {lt: query.added_before};
    else if(query.added_after) qwhere.createdAt = {gt: query.added_after};

    //filter films updated in the following time interval
    if(query.updated_before && query.updated_after) qwhere.createdAt = {lt: query.updated_before, gt: query.updated_after};
    else if(query.updated_before) qwhere.updatedAt = {lt: query.updated_before};
    else if(query.updated_after) qwhere.updatedAt = {gt: query.updated_after};

    //start building where
    final_where.where = qwhere;

    //if(parseInt(query._end) !== -1){
    final_where.offset = isNaN(parseInt(query._start)) ? 0:parseInt(query._start);
    final_where.limit =  isNaN(parseInt(query._end)) ?  req.app.locals.settings.vod_subset_nr: parseInt(query._end) - final_where.offset;
    //}

    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
    final_where.include = [models.vod_category];
    //end build final where

    console.log(final_where);

    models.vod.findAndCountAll(
        final_where
    ).then(function(results) {
        var raw_result = [];
        //flatten nested json array
        results.rows.forEach(function(obj){
            var raw_obj = {};

            Object.keys(obj.toJSON()).forEach(function(k) {
                if (typeof obj[k] == 'object') {
                    Object.keys(obj[k]).forEach(function(j) {
                        raw_obj.id = String(obj.id);
                        raw_obj.title = obj.title;
                        raw_obj.pin_protected = (obj.pin_protected === true) ? 1 : 0;
                        raw_obj.duration = obj.duration;
                        raw_obj.stream_format = obj[k][j].stream_format;
                        raw_obj.url = obj[k][j].url;
                        raw_obj.description = obj.description + ' Director: ' + obj.director + ' Starring: ' + obj.starring;
                        raw_obj.icon = req.app.locals.settings.assets_url+obj.icon_url;
                        raw_obj.largeimage = req.app.locals.settings.assets_url+obj.image_url;
                        raw_obj.categoryid = String(obj.category_id);
                        raw_obj.dataaded = obj.createdAt.getTime();
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

        res.setHeader("X-Total-Count", results.count);
        response.send_res_get(req, res, raw_result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');

    }).catch(function(err) {
        res.jsonp(err);
    });
};

exports.searchvod = function(req, res) {
    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id', 'title'],
        include: [
            {model: models.vod_stream, required: true, attributes: ['url', 'encryption']},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ],
        where: {pin_protected:{in: allowed_content}, isavailable: true, title: {like: '%'+req.body.search_string+'%'}}
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
