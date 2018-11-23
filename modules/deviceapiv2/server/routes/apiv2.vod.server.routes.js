'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    authpolicy = require('../auth/apiv2.server.auth.js'),
    vodController = require(path.resolve('./modules/deviceapiv2/server/controllers/vod.server.controller')),
    winston = require(path.resolve('./config/lib/winston'));

module.exports = function(app) {

    //vod set top box
    app.route('/apiv2/vod/list')
        .all(authpolicy.isAllowed)
        .post(vodController.list);

    app.route('/apiv2/vod/list/:pagenumber')
        .all(authpolicy.isAllowed)
        .get(vodController.list_get);

    app.route('/apiv2/vod/categories')
        .all(authpolicy.isAllowed)
        .get(vodController.categories_get)
        .post(vodController.categories);


    app.route('/apiv2/vod/subtitles')
        .all(authpolicy.isAllowed)
        .get(vodController.subtitles_get)
        .post(vodController.subtitles);

    app.route('/apiv2/vod/movie_subtitle')
        .all(authpolicy.isAllowed)
        .post(vodController.subtitles);

    app.route('/apiv2/vod/totalhits')
        .all(authpolicy.isAllowed)
        .post(vodController.totalhits);

    app.route('/apiv2/vod/mostwatched')
        .all(authpolicy.isAllowed)
        .get(vodController.mostwatched_get)
        .post(vodController.mostwatched);


    app.route('/apiv2/vod/mostrated')
        .all(authpolicy.isAllowed)
        .get(vodController.mostrated_get)
        .post(vodController.mostrated);


    app.route('/apiv2/vod/related')
        .all(authpolicy.isAllowed)
        .post(vodController.related);

    app.route('/apiv2/vod/suggestions')
        .all(authpolicy.isAllowed)
        .get(vodController.suggestions_get)
        .post(vodController.suggestions);


    app.route('/apiv2/vod/categoryfilms')
        .all(authpolicy.isAllowed)
        .get(vodController.categoryfilms_get)
        .post(vodController.categoryfilms);

    app.route('/apiv2/vod/searchvod')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_list)
        .post(vodController.searchvod);

    //testing api
    app.route('/apiv2/vod/vodlist/:pagenumber')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_list);


    app.route('/apiv2/vod/vodlist')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_list);

    app.route('/apiv2/vod/vod_details/:vod_id')
        .all(authpolicy.isAllowed)
        .get(vodController.get_movie_details);

    //testing api returning new/modified data
    app.route('/apiv2/vod/listnewdata/:pagenumber')
        .all(authpolicy.isAllowed)
        .get(vodController.list_get_newdata);


    //Get VOD Item Details
    app.route('/apiv2/vod/voditem/:vodID')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_item_details);

    //Get TVSHOW Item Details with default Season = 1
    app.route('/apiv2/vod/tvshow_details/:tvshowID')
        .all(authpolicy.isAllowed)
        .get(vodController.get_tvshow_item_details);

    //Get TVSHOW Item Details with episodes for specific Season
    app.route('/apiv2/vod/tvshow_details/:tvshowID/:seasonNumber')
        .all(authpolicy.isAllowed)
        .get(vodController.get_tvshow_item_details);


    app.route('/apiv2/vod/related/:vodID')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_item_related);

    app.route('/apiv2/vod/recommended')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_items_recommended);


    app.route('/apiv2/vod/resume_movie')
        .all(authpolicy.isAllowed)
        .post(vodController.resume_movie);

    app.route('/apiv2/vod/get_tv_series_data/:tvshowID')
        .all(authpolicy.isAllowed)
        .get(vodController.get_tv_series_data)

    app.route('/apiv2/vod/get_tv_series_data/:tvshowID/:seasonNumber')
        .all(authpolicy.isAllowed)
        .get(vodController.get_tv_series_data)


    app.route('/apiv2/vod/vod_menu')
        .all(authpolicy.isAllowed)
        .get(vodController.vod_menu_list)


};

