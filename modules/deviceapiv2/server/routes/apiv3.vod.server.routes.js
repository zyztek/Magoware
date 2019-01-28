'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    authpolicy = require('../auth/apiv2.server.auth.js'),
    vodControllerv2 = require(path.resolve('./modules/deviceapiv2/server/controllers/vod.server.controller')),
    vodController = require(path.resolve('./modules/deviceapiv2/server/controllers/vod_v3.server.controller')),
    winston = require(path.resolve('./config/lib/winston'));

module.exports = function(app) {

    app.route('/apiv3/vod/vod_details/:vod_id')
        .all(authpolicy.isAllowed)
        .get(vodController.get_movie_details);

    app.route('/apiv3/vod/vod_list')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_list);

    app.route('/apiv3/vod_payment/vod_purchase/:vod_id/:client_username')
        .all(vodController.buy_vod_item);

    app.route('/apiv3/vod/reaction/:vod_id/:reaction')
        .all(authpolicy.isAllowed)
        .put(vodController.reaction)
        .post(vodController.reaction);

    app.route('/apiv3/vod/vod_related/:vod_id')
        .all(authpolicy.isAllowed)
        .get(vodController.get_related_movies);

    app.route('/apiv3/vod/get_random_movie')
        .all(authpolicy.isAllowed)
        .get(vodController.get_random_vod_item)
        .get(vodController.get_movie_details);


    //to be finalized todo: implement functions

    //Vod Menu & Carousel
    app.route('/apiv3/vod/vod_menu')
        .all(authpolicy.isAllowed)
        .get(vodControllerv2.vod_menu_list);

    app.route('/apiv3/vod/vod_details/:vod_id/similar')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_list);

    app.route('/apiv3/vod/vod_details/:vod_id/recommendations')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_list);

    app.route('/apiv3/vod/mostwatched')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_list);

    app.route('/apiv3/vod/purchase_list')
        .all(authpolicy.isAllowed)
        .get(vodController.get_purchased_movies);

    app.route('/apiv3/vod/tvod_movies')
        .all(authpolicy.isAllowed)
        .get(vodController.get_tvod_movies);

};