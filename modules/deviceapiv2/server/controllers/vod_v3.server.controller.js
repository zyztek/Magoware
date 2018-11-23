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
var config = require(path.resolve('./config/config'));

/**
 * @api {get} /apiv3/vod/vod_details/:vod_id GetVodItemDetails
 * @apiName GetVodItemDetails
 * @apiGroup VOD_V3
 *
 * @apiUse header_auth
 *
 *@apiDescription Returns information about the subtitles and stream of a vod item
 *
 * Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
exports.get_movie_details = function(req, res) {
    var attributes = [
        'id', ['adult_content', 'adult'], 'homepage', 'budget', 'price', 'mandatory_ads', 'imdb_id', 'original_language', 'original_title',
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('image_url')), 'backdrop_path'],
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('vod.icon_url')), 'poster_path'],
        ['description', 'overview'], 'popularity', 'release_date', 'revenue', ['duration', 'runtime'], 'vote_count', 'trailer_url', 'vod_preview_url', 'default_subtitle_id',
        [sequelize.fn('DATE_FORMAT', sequelize.col('release_date'), '%Y-%m-%d'), 'release_date'], 'revenue', ['duration', 'runtime'], 'spoken_languages', 'status', 'tagline', 'title', 'vote_average'
    ];

    models.vod.findOne({
        attributes: attributes,
        include: [
            {model: models.vod_stream, attributes: ['stream_format', 'url', 'token', 'token_url', 'encryption', 'encryption_url'], where: {stream_source_id: req.thisuser.vod_stream_source}},
            {
                model: models.vod_subtitles,
                attributes: ['id', 'title', [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('subtitle_url')), 'url'], ['vod_id', 'vodid']]
            },
            {model: models.vod_vod_categories, attributes: ['id'], required: true, include: [{model: models.vod_category, attributes: ['id', 'name'], required: true}]},
            {model: models.t_vod_sales, attributes: ['id'], required: false, where: {login_data_id: req.thisuser.id, vod_id: req.params.vod_id, end_time: {$gte: Date.now()}}},
            {model: models.vod_resume, attributes: ['resume_position', 'reaction'], required: false, where: {login_id: req.thisuser.id}}
        ],
        where: {id: req.params.vod_id, vod_type: {$in: ['film', 'tv_episode']}}
    }).then(function (result) {
        //check whether vod item is part of the user's active subscription
        models.subscription.findOne({
            attributes: ['id'], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}, include: [
                {model: models.package, attributes: ['id'], required: true, where: {package_type_id: req.auth_obj.screensize + 2 }, include: [
                    {model: models.package_vod, attributes: ['id'], where: {vod_id: req.params.vod_id}, required: true}
                ]}
            ]
        }).then(function(subscription_result){
            if (!result || result.length < 1) {
                response.send_res_get(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
            }
            else {
                var vod_data = {};
                if (result) {
                    vod_data = result.toJSON(); //convert query results from instance to JSON, to modify it

                    //find and asign value of default subtitle
                    if(result.vod_subtitles){
                        try {
                            var found = result.vod_subtitles.find(function (x) {if (x.id === (result.default_subtitle_id)) {return x.title;}}).title;
                        }
                        catch (error) {
                            var found = "";
                        }
                    }
                    delete vod_data.default_subtitle_id;
                    vod_data.default_language = found;

                    //prepare array of categories
                    vod_data.genres = [];
                    for (var i = 0; i < vod_data.vod_vod_categories.length; i++) vod_data.genres.push({
                        "id": vod_data.vod_vod_categories[i].vod_category.id,
                        "name": vod_data.vod_vod_categories[i].vod_category.name
                    });
                    delete vod_data.vod_vod_categories;

                    //prepare stream object
                    vod_data.vod_stream = vod_data.vod_streams[0];
                    delete vod_data.vod_streams;

                    //prepare dynamic button list based on client rights to play the item
                    var play_buy = ((vod_data.t_vod_sales && vod_data.t_vod_sales.length > 0) || (subscription_result)) ? {name:"play", description:"Play"} : {name:"buy", description:"Buy"};
                    vod_data.actions = [
                        play_buy,
                        {name:"related", description:"Related"},
                        {name:"trailer", description:"Trailer"},
                        {name:"thumbup", description:"Thumbup"},
                        {name:"thumbdown", description:"Thumbdown"}
                    ];
                    delete vod_data.t_vod_sales;

                    vod_data.payment_url = req.app.locals.backendsettings.assets_url + "/apiv3/vod_payment/vod_purchase/" + vod_data.id + '/' + req.thisuser.username;

                    //prepare ads object
                    vod_data.watch_mandatory_ad = {
                        "get_ads": (req.thisuser.get_ads || vod_data.mandatory_ads) ? 1 : 0,
                        "vast_ad_url": "https://servedbyadbutler.com/vast.spark?setID=5291&ID=173381&pid=57743"
                    };
                    delete vod_data.mandatory_ads;

                    //prepare position and reaction object
                    if (vod_data.vod_resumes.length < 1) vod_data.vod_resumes = {"resume_position": 0, "reaction": 0};
                    else vod_data.vod_resumes = vod_data.vod_resumes[0];

                }
                response.send_res_get(req, res, [vod_data], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
            }
        }).catch(function(error){
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};



exports.buy_vod_item = function(req,res) {
    models.vod.findOne({
        attributes: ['title', 'icon_url', 'price'],
        where: {id: req.params.vod_id}
    }).then(function(vod_data){
        var payment_confirmation_url = req.app.locals.backendsettings.assets_url+'/apiv2/vod/confirm_vod_purchase/'+req.params.vod_id+'/'+req.params.client_username;
        var template = '<!DOCTYPE html>'+
            '<html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><title></title></head>'+
            '<body>'+
            '<p>Dear '+req.params.client_username+',</p><p>Welcome to '+config.app.title+
            '</p><p>Please click the link below to confirm your purchase of the film '+vod_data.title+':</p>'+
            '<img src="'+req.app.locals.backendsettings.assets_url+vod_data.icon_url+'" alt="'+vod_data.title+'" width="360" height="516">'+
            '<p><a href="'+payment_confirmation_url+'">Buy Film</a></p>'+
            '</body>'+
            '</html>';
        res.send(template);
        return null;
    }).catch(function(error){
        res.send( error);
    });
};

exports.confirm_vod_purchase = function(req,res) {
    models.login_data.findOne({
        attributes: ['id'], where: {username: req.params.client_username}
    }).then(function(client_data){
        models.t_vod_sales.create({
            vod_id: req.params.vod_id,
            login_data_id: client_data.id,
            start_time: Date.now(),
            end_time: Date.now() + 172800000
        }).then(function(successful_purchase){
            res.status(200).send("Successful purchase");
        }).catch(function(error){
            res.status(400).send("Error purchasing film ", error);
        });
        return null;
    }).catch(function(error){
        res.send( error);
    });

};


/**
 * @api {get} /apiv3/vod/vod_list GET VOD Items
 * @apiName GetVodList
 * @apiGroup VOD_V3
 *
 * @apiUse header_auth
 *
 * @apiParam {Number} [page] Pagination number
 * @apiParam {String} [search]  Partial search string. Searches in following fields: title, original_title, description, tagline, cast, director
 * @apiParam {String} [pin_protected]  If specified, returns only items that are / are not pin protected. Value set [true, false]
 * @apiParam {Number} [category_id] Filter vod items by category id
 * @apiParam {String} [order_by] Orders items by a specified field. Creation date is the default. Value set is [year, clicks, rate, vote_average, vote_count, popularity, duration, pin_protected, adult_content, isavailable, expiration_time, price, revenue, budget, release_date]
 * @apiParam {String} [order_dir] Order direction. Descending is default. Value set is [desc, asc]
 *
 *@apiDescription Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
exports.get_vod_list = function(req,res) {

    var page_length = (req.app.locals.backendsettings.vod_subset_nr) ? req.app.locals.backendsettings.vod_subset_nr : 30; //max nr of movies in the response
    if (!req.query.page) req.query.page = 1; //if page param is missing, set page to 1
    var final_where = {};
    final_where.where = {};

    //set range of movies
    final_where.offset = (!req.query.page) ? 0 : (((parseInt(req.query.page) - 1)) * page_length);
    final_where.limit = page_length;

    //attribute list
    final_where.attributes = [
        'id', 'vote_count', 'vote_average', 'title', 'popularity',
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('image_url')), 'backdrop_path'],
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('icon_url')), 'poster_path'],
        'original_language', 'original_title', ['adult_content', 'adult'], ['description', 'overview'], [sequelize.fn('DATE_FORMAT', sequelize.col('release_date'), '%Y-%m-%d'), 'release_date']
    ];

    //prepare search condition by keyword
    if(req.query.search) {
        final_where.where.$or = {
            title: {$like: '%'+req.query.search+'%'},
            original_title: {$like: '%'+req.query.search+'%'},
            description: {$like: '%'+req.query.search+'%'},
            tagline: {$like: '%'+req.query.search+'%'},
            director: {$like: '%'+req.query.search+'%'},
            starring: {$like: '%'+req.query.search+'%'}
        };
    }

    //filter list
    final_where.where.isavailable = true; //return only available movies
    final_where.where.pin_protected = (!req.query.pin_protected) ? {in: [true, false]} : (req.query.pin_protected == "true"); //all content returned by default, unless specified otherwise by pin_protected
    final_where.where.adult_content = (req.thisuser.show_adult === true) ? {in: [true, false]} : false; //adult content returned only if user settings allows it

    //prepare order clause
    var order_by = (req.query.order_by) ? req.query.order_by : 'createdAt';
    var order_dir = (req.query.order_dir) ? req.query.order_dir : 'DESC';
    final_where.order = [[order_by, order_dir]];

    var category_filter = (req.query.category_id) ? {category_id: Number(req.query.category_id)} : {vod_id: {gt: 0}}; //if specified, filter by category id

    //join tables
    final_where.include = [
        {model: models.vod_vod_categories, required: true, attributes: [], where: category_filter}
    ];

    final_where.subQuery = false; //keeps subquery from generating

    //start query
    models.vod.findAndCountAll(
        final_where
    ).then(function(results) {
        var vod_list = {
            "page": Number(req.query.page), //page number
            "total_results": results.count, //number of vod items in total for this user
            "total_pages": Math.ceil(results.count/page_length), //number of pages for this user
            "results": results.rows //return found records
        };
        res.setHeader("X-Total-Count", results.count);
        response.send_res_get(req, res, vod_list, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};


/**
 * @api {put} /apiv3/vod/reaction/:vod_id/:reaction
 * @apiName SendVodReaction
 * @apiGroup VOD_V3
 *
 * @apiUse header_auth
 *
 *@apiDescription Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
exports.reaction = function(req,res) {
    models.vod_resume.upsert(
        {
            login_id: req.thisuser.id,
            vod_id: req.params.vod_id,
            resume_position: 0,
            reaction: req.params.reaction,
            device_id: req.auth_obj.boxid
        }
    ).then(function (result) {
        response.send_res_get(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function (error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};


/**
 * @api {get} /apiv3/vod/get_random_movie Get A Random Movie
 * @apiName Get Random Movie
 * @apiGroup VOD_V3 *
 * @apiUse header_auth *
 * @apiDescription Get random movie from premium content
 * auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
exports.get_random_vod_item = function(req,res,next) {
    models.vod.findOne({
        attributes: ['id'],
        where: {vod_type: {$in: ['film', 'tv_episode']}, isavailable: true},
        order: sequelize.fn('RAND')
    }).then(function (result) {
        req.params.vod_id = result.id;
        next();
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

/**
 * @api {get} /apiv3/vod/vod_related/:vod_id
 * @apiName GetRelatedMovies
 * @apiGroup VOD_V4
 *
 * @apiUse header_auth
 *
 * @apiParam {Number} [page] Pagination number
 *
 *@apiDescription Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */

exports.get_related_movies = function (req, res) {

    var page_length = (req.app.locals.backendsettings.vod_subset_nr) ? req.app.locals.backendsettings.vod_subset_nr : 30; //max nr of movies in the response
    if (!req.query.page) req.query.page = 1; //if page param is missing, set page to 1

    //set range of movies
    var offset = (!req.query.page) ? 0 : (((parseInt(req.query.page) - 1)) * page_length);
    var limit = page_length; //number of records per request

    models.vod.findAll({
        attributes: ['director', 'starring', 'vod_type'], where: {id: req.params.vod_id},
        limit: 1
    }).then(function (result) {
        if (result && result.length > 0) {

            var director_list = result[0].director.split(',');
            var director_matching_score = "";
            for (var i = 0; i < director_list.length; i++) {
                if (i === director_list.length - 1) director_matching_score = director_matching_score + " IF( ( director like '%" + director_list[i].trim() + "%' ), 0.5, 0)";
                else director_matching_score = director_matching_score + " IF( ( director like '%" + director_list[i].trim() + "%' ), 0.5, 0) + "
            }

            var actor_list = result[0].starring.split(',');
            var actor_matching_score = "";
            for (var j = 0; j < actor_list.length; j++) {
                if (j === actor_list.length - 1) actor_matching_score = actor_matching_score + " IF( ( starring like '%" + actor_list[j].trim() + "%' ), 0.3, 0)";
                else actor_matching_score = actor_matching_score + " IF( ( starring like '%" + actor_list[j].trim() + "%' ), 0.3, 0) + "
            }

            //return only movies with stream from same origin as the client's
            var vod_stream = {
                join_query: " INNER JOIN vod_stream ON vod.id = vod_stream.vod_id ",
                where_condition: " AND vod_stream.stream_source_id = " + req.thisuser.vod_stream_source
            };

            //prepare the where clause
            var where_condition = "";
            where_condition += " vod.id <> " + req.params.vod_id; //exclude current movie from list
            where_condition += " AND vod.isavailable = true"; //return only available movies
            where_condition += " AND expiration_time > NOW() " + vod_stream.where_condition; //do not return movies that have expired
            if (req.query.pin_protected) where_condition += " AND pin_protected = " + (req.query.pin_protected == "true"); //all content returned by default, unless specified otherwise by pin_protected
            if (req.thisuser.show_adult !== true) where_condition += " AND show_adult = false ";


            var related_query = "SELECT " +
                "DISTINCT vod.id, vod.vote_count, vod.vote_average, vod.title, vod.popularity, vod.original_language, vod.original_title, vod.adult_content as adult, vod.description as overview, " +
                " concat('" + req.app.locals.backendsettings.assets_url + "', vod.image_url) as backdrop_path," +
                " concat('" + req.app.locals.backendsettings.assets_url + "', vod.icon_url) as poster_path," +
                " DATE_FORMAT(vod.release_date, '%Y-%m-%d') as release_date, " +
                " ( " +
                    //" IF( (category_id = "+result[0].category_id+"), 1, 0) + "+ //category matching score
                " ( " + director_matching_score + " ) + " + //director matching score
                " ( " + actor_matching_score + " ) " + //actor matching score
                " ) AS matching_score " +
                " FROM vod " +
                " INNER JOIN vod_vod_categories ON vod.id = vod_vod_categories.vod_id INNER JOIN vod_category ON vod_vod_categories.category_id = vod_category.id " +
                vod_stream.join_query +
                " WHERE " + where_condition +
                " GROUP BY vod.id " +
                " ORDER BY  matching_score DESC " + //order movies from most related to least related
                " LIMIT " + offset + ", " + limit + " " +
                ";";

            sequelizes.sequelize.query(
                related_query
            ).then(function (related_result) {
                if (!related_result || !related_result[0]) {
                    response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'NO DATA FOUND', 'no-store');
                } else {
                    res.setHeader("X-Total-Count", related_result[0].length);
                    response.send_res_get(req, res, related_result[0], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
                }
            }).catch(function (error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
        }
        else {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'NO DATA FOUND', 'no-store');
        }
        return null;
    }).catch(function (error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};