'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    models = db.models,
    sequelize = require('sequelize'),
    async = require('async'),
    response = require(path.resolve("./config/responses.js")),
    winston = require(path.resolve('./config/lib/winston')),
    moment = require('moment');


/**
 * @api {get} /apiv3/tv_show/tv_show_list GetTvShowList
 * @apiName GetTvShowList
 * @apiGroup TV SHOWS
 *
 * @apiUse header_auth
 *
 * @apiParam {Number} [page] Page (pagination) number. If missing, returns first page
 * @apiParam {String} [search]  Partial search string. Searches in following fields: title, original_title, description, tagline
 * @apiParam {String} [pin_protected]  Flag for pin protected content. Only if set to true, pin protected content is included in the response
 * @apiParam {String} [show_adult]  Flag for adult content. Only if set to true, adult content is included in the response
 * @apiParam {Number} [category_id] Filter tv shows by category id
 * @apiParam {String} [order_by] Orders items by a specified field. Creation date is the default. Value set is [clicks, rate, vote_average, vote_count, popularity,  pin_protected, adult_content, isavailable, expiration_time, price, revenue, budget, release_date]
 * @apiParam {String} [order_dir] Order direction. Descending is default. Value set is [desc, asc]
 *
 *@apiDescription
 *
 * Non-available and expired tv shows are excluded. By default, pin protected or adult movies are not returned, unless specified otherwise.
 *
 * Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
exports.tv_show_list = function(req, res) {

    var page_length = (req.app.locals.backendsettings.vod_subset_nr) ? req.app.locals.backendsettings.vod_subset_nr : 30; //max nr of movies in the response
    if (!req.query.page) req.query.page = 1; //if page param is missing, set page to 1
    var final_where = {};
    final_where.where = {};

    //set range of movies
    final_where.offset = (!req.query.page) ? 0 : (((parseInt(req.query.page) - 1)) * page_length);
    final_where.limit = page_length;

    //attribute list
    final_where.attributes = [
        'id', 'vote_count', 'vote_average', 'title', 'popularity', [ sequelize.literal('"tv_series"'), 'vod_type'], 'trailer_url',
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('tv_series.image_url')), 'backdrop_path'],
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('tv_series.icon_url')), 'poster_path'],
        'original_language', 'original_title', ['adult_content', 'adult'], ['description', 'overview'], [sequelize.fn('DATE_FORMAT', sequelize.col('tv_series.release_date'), '%Y-%m-%d'), 'release_date']
    ];

    //prepare search condition by keyword
    if(req.query.search) {
        final_where.where.$or = {
            title: {$like: '%'+req.query.search+'%'},
            original_title: {$like: '%'+req.query.search+'%'},
            description: {$like: '%'+req.query.search+'%'},
            tagline: {$like: '%'+req.query.search+'%'},
            starring: {$like: '%'+req.query.search+'%'}
        };
    }

    //filter list
    final_where.where.is_available = true; //return only available tv series
    final_where.where.expiration_time = {$gte: Date.now()}; //exclude tv series that have not expired yet
    final_where.where.pin_protected = (req.query.pin_protected === 'true') ? {in: [true, false]} : false; //pin protected content returned only if request explicitly asks for it
    final_where.where.adult_content = (req.query.show_adult === 'true') ? {in: [true, false]} : false; //adult content returned only if request explicitly asks for it

    //prepare order clause
    var order_by = (req.query.order_by) ? req.query.order_by : 'createdAt';
    var order_dir = (req.query.order_dir) ? req.query.order_dir : 'DESC';
    final_where.order = [[order_by, order_dir]];

    var category_filter = (req.query.category_id) ? {category_id: Number(req.query.category_id)} : {tv_show_id: {gt: 0}}; //if specified, filter by category id

    //join tables
    final_where.include = [
        {model: models.tv_series_categories, required: true, attributes: [], where: category_filter},
        {model: models.tv_season, attributes: ['id', 'season_number', 'title'], required: false, where: {expiration_time: {$gte: Date.now()}, is_available: true}}
    ];

    final_where.subQuery = false; //keeps subquery from generating

    //start query
    models.tv_series.findAndCountAll(
        final_where
    ).then(function(results) {
        var tv_show_list = [];
        async.forEach(results.rows, function(tv_show, callback){
            tv_show = tv_show.toJSON();
            tv_show.last_watched = {
                "episode_id": 1,
                "season_id": 1,
                "season_number": 1,
                "episode_number": 1
            };
            tv_show_list.push(tv_show);
            callback(null);
        },function(error, result){
            var vod_list = {
                "page": Number(req.query.page), //page number
                "total_results": results.count, //number of vod items in total for this user
                "total_pages": Math.ceil(results.count/page_length), //number of pages for this user
                "results": tv_show_list //return found records
            };
            res.setHeader("X-Total-Count", results.count);
            response.send_res_get(req, res, vod_list, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
        });
    }).catch(function(error) {
        winston.error("Getting the tv show list failed with error: ", error);
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};


/**
 * @api {get} /apiv3/tv_show/tv_show_details/:tv_show_id TvShowDetails
 * @apiName TvShowDetails
 * @apiGroup TV SHOWS
 *
 * @apiUse header_auth
 *
 *@apiDescription Returns information about a tv show
 *
 * Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
exports.tv_show_details = function(req, res) {
    var attributes = [
        'id', 'title', ['adult_content', 'adult'], [ sequelize.literal('"tv_series"'), 'vod_type'], 'homepage', 'budget', 'price', 'mandatory_ads', 'imdb_id', 'original_language', 'original_title', 'expiration_time',
        'cast', 'director', ['description', 'overview'], 'tagline', 'popularity', 'vote_count', 'vote_average', 'revenue', 'spoken_languages', 'status',
        'episode_runtime', 'production_company', 'origin_country', 'trailer_url',
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('tv_series.image_url')), 'backdrop_path'],
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('tv_series.icon_url')), 'poster_path'],
        [sequelize.fn('DATE_FORMAT', sequelize.col('tv_series.release_date'), '%Y-%m-%d'), 'first_air_date']
    ];

    models.tv_series.findOne({
        attributes: attributes,
        include: [
            {model: models.tv_series_categories, attributes: ['id'], required: true, include: [{model: models.vod_category, attributes: ['id', 'name'], required: true}]},
            {model: models.t_tv_series_sales, attributes: ['id'], required: false, where: {login_data_id: req.thisuser.id, tv_show_id: req.params.tv_show_id, end_time: {$gte: Date.now()}}},
            {model: models.tv_season, attributes: ['id', 'season_number', 'title'], required: false, where: {expiration_time: {$gte: Date.now()}, is_available: true}},
            {
                model: models.tv_season, as: 'season', attributes: ['id'], required: false, where: {expiration_time: {$gte: Date.now()}, is_available: true},
                include: [{model: models.tv_episode, attributes: ['id', 'tv_season_id', 'season_number', 'episode_number'], required: false, where: {expiration_time: {$gte: Date.now()}, is_available: true},
                    include: [{model: models.tv_episode_resume, attributes: [[sequelize.fn('MAX', sequelize.col('season.tv_episodes.tv_episode_resumes.updatedAt')), 'last_watched']],
                        required: false, where: {login_id: req.thisuser.id}}]
                }]
            }
        ],
        where: {id: req.params.tv_show_id}
    }).then(function (result) {
        //check whether vod item is part of the user's active subscription
        models.subscription.findOne({
            attributes: ['id'], where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}, include: [
                {model: models.package, attributes: ['id'], required: true, where: {package_type_id: req.auth_obj.screensize + 2 }, include: [
                    {model: models.tv_series_packages, attributes: ['id'], where: {tv_show_id: req.params.tv_show_id}, required: true}
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

                    //prepare array of categories
                    vod_data.genres = [];
                    for (var i = 0; i < vod_data.tv_series_categories.length; i++) vod_data.genres.push({
                        "id": vod_data.tv_series_categories[i].vod_category.id,
                        "name": vod_data.tv_series_categories[i].vod_category.name
                    });
                    delete vod_data.tv_series_categories;

                    //prepare object of last watched episode
                    if(vod_data.season[0].tv_episodes[0].tv_episode_resumes[0]){
                        vod_data.last_watched = {
                            "episode_id": vod_data.season[0].tv_episodes[0].id,
                            "season_id": vod_data.season[0].tv_episodes[0].tv_season_id,
                            "season_number": vod_data.season[0].tv_episodes[0].season_number,
                            "episode_number": vod_data.season[0].tv_episodes[0].episode_number
                        };
                    }
                    else vod_data.last_watched = {};
                    delete vod_data.season;

                    //prepare dynamic button list based on client rights to play the item
                    vod_data.actions = [
                        {name:"related", description:"Related"},
                        {name:"trailer", description:"Trailer"},
                        {name:"thumbup", description:"Thumbup"},
                        {name:"thumbdown", description:"Thumbdown"}
                    ];

                    if((vod_data.t_tv_series_sales && vod_data.t_tv_series_sales.length > 0) || (subscription_result)) vod_data.actions.push({name:"play", description:"Play"});
                    else if( (moment(vod_data.expiration_time) > moment().add(req.app.locals.backendsettings.t_vod_duration, 'day')) && (vod_data.price > 0) ){
                        vod_data.actions.push({name:"buy", description:"Buy"});
                    }
                    else vod_data.actions.push({name: "coming_soon", description: "Coming soon"}); //tv show cannot be played, and is not available to buy
                    delete vod_data.t_tv_series_sales;

                    //add url where client can buy a movie
                    vod_data.payment_url = req.app.locals.backendsettings.assets_url + "/apiv3/vod_payment/vod_purchase/" + vod_data.id + '/' + req.thisuser.username;

                    //delete expiration time, application does not need it
                    delete vod_data.expiration_time;

                    vod_data.vod_resumes = {
                        "reaction":  Math.floor(Math.random() * 3) -1
                    };
                }
                response.send_res_get(req, res, [vod_data], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
            }
        }).catch(function(error){
            winston.error("Querying for the user's subscription failed with error: ", error);
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        winston.error("Querying for the details of the tv show item failed with error: ", error);
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};


/**
 * @api {get} /apiv3/tv_show/episode_list/:tv_show_id/:season_number GetEpisodeList
 * @apiName GetEpisodeList
 * @apiGroup TV SHOWS
 *
 * @apiUse header_auth
 *
 * @apiParam {Number} [page] Pagination number
 * @apiParam {String} [search]  Partial search string. Searches in following fields: title, original_title, description, tagline, cast, director
 * @apiParam {String} [pin_protected]  Flag for pin protected content. If set to true, pin protected content is included in the response. Value set: ['true']
 * @apiParam {String} [show_adult]  Flag for adult content. If set to true, adult content is included in the response. Value set: ['true']
 * @apiParam {String} [order_by] Orders items by a specified field. Episode order is the default. Value set is [clicks, rate, vote_average, vote_count, popularity, duration, pin_protected, adult_content, isavailable, expiration_time, price, revenue, budget, release_date]
 * @apiParam {String} [order_dir] Order direction. Descending is default. Value set is [desc, asc]
 *
 *@apiDescription Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
exports.episode_list = function(req, res) {

    var page_length = (req.app.locals.backendsettings.vod_subset_nr) ? req.app.locals.backendsettings.vod_subset_nr : 30; //max nr of movies in the response
    if (!req.query.page) req.query.page = 1; //if page param is missing, set page to 1
    var final_where = {};
    final_where.where = {};

    //set range of movies
    final_where.offset = (!req.query.page) ? 0 : (((parseInt(req.query.page) - 1)) * page_length);
    final_where.limit = page_length;

    //attribute list
    final_where.attributes = [
        'id', 'vote_count', 'vote_average', 'title', 'popularity', [ sequelize.literal('"tv_episode"'), 'vod_type'], 'tagline',
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('image_url')), 'backdrop_path'], 'original_language', 'original_title',
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('icon_url')), 'poster_path'],
        ['adult_content', 'adult'], ['description', 'overview'], [sequelize.fn('DATE_FORMAT', sequelize.col('release_date'), '%Y-%m-%d'), 'release_date']
    ];

    //prepare search condition by keyword
    if(req.query.search) {
        final_where.where.$or = {
            title: {$like: '%'+req.query.search+'%'},
            original_title: {$like: '%'+req.query.search+'%'},
            description: {$like: '%'+req.query.search+'%'},
            tagline: {$like: '%'+req.query.search+'%'},
            director: {$like: '%'+req.query.search+'%'},
            cast: {$like: '%'+req.query.search+'%'}
        };
    }

    //filter list
    final_where.where.is_available = true; //return only available movies
    final_where.where.pin_protected = (!req.query.pin_protected) ? {in: [true, false]} : false; //pin_protected content returned only if user settings allows it
    final_where.where.adult_content = (req.query.show_adult === 'true') ? {in: [true, false]} : false; //adult content returned only if user settings allows it
    final_where.where.expiration_time = {$gte: Date.now()};

    //prepare order clause
    var order_by = (req.query.order_by) ? req.query.order_by : 'createdAt';
    var order_dir = (req.query.order_dir) ? req.query.order_dir : 'DESC';
    final_where.order = [[order_by, order_dir]];

    final_where.subQuery = false; //keeps subquery from generating

    models.tv_season.findOne({
        attributes: ['id'],
        where: {tv_show_id: req.params.tv_show_id, season_number: req.params.season_number, is_available: true}
    }).then(function(season){
        if(season && season.id){
            final_where.where.tv_season_id = season.id;
            //start query
            models.tv_episode.findAndCountAll(
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
                winston.error("Getting the movie list failed with error: ", error);
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
            return null;
        }
        else{
            winston.error("Season with number "+req.query.season+" does not exist for this tv show");
            response.send_res_get(req, res, [], 200, 1, 'NOT_FOUND_DESCRIPTION', 'NO_DATA_FOUND', 'private,max-age=86400');
        }
    }).catch(function(error){
        winston.error("Getting the episode list failed with error: ", error);
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });


};


/**
 * @api {get} /apiv3/tv_show/episode_details/:episode_id GetEpisodeDetails
 * @apiName GetEpisodeDetails
 * @apiGroup TV SHOWS
 *
 * @apiUse header_auth
 *
 *@apiDescription Returns details of an episode
 *
 * Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
exports.episode_details = function(req, res) {
    var attributes = [
        'id', ['adult_content', 'adult'], [sequelize.literal('"tv_episode"'), 'vod_type'], 'homepage', 'budget', 'mandatory_ads', 'imdb_id', 'original_language', 'original_title', 'expiration_time', 'price', 'status',
        'cast', 'director', 'title', ['description', 'overview'], ['duration', 'runtime'], 'vote_count', 'vote_average', 'popularity', 'revenue', 'tagline',
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('image_url')), 'backdrop_path'],
        [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('tv_episode.icon_url')), 'poster_path'],
        'trailer_url', 'vod_preview_url', 'default_subtitle_id',  'spoken_languages', [sequelize.fn('DATE_FORMAT', sequelize.col('release_date'), '%Y-%m-%d'), 'air_date']

    ];

    models.tv_episode.findOne({
        attributes: attributes,
        include: [
            {
                model: models.tv_episode_stream, attributes: ['stream_format', ['tv_episode_url', 'url'], 'token', 'token_url', 'encryption', 'encryption_url'],
                where: {stream_source_id: req.thisuser.vod_stream_source, stream_resolution: {$like: "%"+req.auth_obj.appid+"%"}}, required: false
            },
            {
                model: models.tv_episode_subtitles,
                attributes: ['id', 'title', [db.sequelize.fn("concat", req.app.locals.backendsettings.assets_url, db.sequelize.col('subtitle_url')), 'url'], ['tv_episode_id', 'vodid']]
            },
            {model: models.tv_episode_resume, attributes: ['resume_position'], required: false, where: {login_id: req.thisuser.id}}
        ],
        where: {id: req.params.episode_id}
    }).then(function (result) {

        if (result) {
            var vod_data = {};
            vod_data = result.toJSON(); //convert query results from instance to JSON, to modify it

            //find and asign value of default subtitle
            if(result.tv_episode_subtitles){
                try {
                    var found = result.tv_episode_subtitles.find(function (x) {if (x.id === (result.default_subtitle_id)) {return x.title;}}).title;
                }
                catch (error) {
                    var found = "";
                }
            }
            delete vod_data.default_subtitle_id;
            vod_data.default_language = found;

            //rename subtitle object
            vod_data.vod_subtitles = (vod_data.tv_episode_subtitles) ? vod_data.tv_episode_subtitles : [];
            delete vod_data.tv_episode_subtitles;

            //rename resume object
            vod_data.vod_resumes = (vod_data.tv_episode_resumes[0]) ? vod_data.tv_episode_resumes[0] : {};
            delete vod_data.tv_episode_resumes;

            //prepare stream object
            vod_data.vod_stream = (vod_data.tv_episode_streams && vod_data.tv_episode_streams[0]) ? vod_data.tv_episode_streams[0] : {};
            delete vod_data.tv_episode_streams;

            //prepare dynamic button list
            vod_data.actions = [
                {name:"trailer", description:"Trailer"},
                {name:"thumbup", description:"Thumbup"},
                {name:"thumbdown", description:"Thumbdown"}
            ];

            //add url where client can buy a movie
            vod_data.payment_url = req.app.locals.backendsettings.assets_url + "/apiv3/vod_payment/vod_purchase/" + vod_data.id + '/' + req.thisuser.username;

            //prepare ads object
            vod_data.watch_mandatory_ad = {
                "get_ads": (req.thisuser.get_ads || vod_data.mandatory_ads) ? 1 : 0,
                "vast_ad_url": "https://servedbyadbutler.com/vast.spark?setID=5291&ID=173381&pid=57743"
            };
            delete vod_data.mandatory_ads;

            delete vod_data.expiration_time; //delete expiration time, application does not need it

            vod_data.resume_position = Math.floor(Math.random() * 98) + 1;

            response.send_res_get(req, res, [vod_data], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400'); //send details object
        }
        else response.send_res_get(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400'); //send details object

    }).catch(function(error) {
        console.log(error)
        winston.error("Querying for the details of the episode failed with error: ", error);
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};