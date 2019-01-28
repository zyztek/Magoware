'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    authpolicy = require('../auth/apiv2.server.auth.js'),
    tvShowController = require(path.resolve('./modules/deviceapiv2/server/controllers/tv_shows.server.controller')),
    winston = require(path.resolve('./config/lib/winston'));

module.exports = function(app) {

    app.route('/apiv3/tv_show/tv_show_list')
        .all(authpolicy.isAllowed)
        .get(tvShowController.tv_show_list);

    app.route('/apiv3/tv_show/tv_show_details/:tv_show_id')
        .all(authpolicy.isAllowed)
        .get(tvShowController.tv_show_details);

    app.route('/apiv3/tv_show/episode_list/:tv_show_id/:season_number')
        .all(authpolicy.isAllowed)
        .get(tvShowController.episode_list);

    app.route('/apiv3/tv_show/episode_details/:episode_id')
        .all(authpolicy.isAllowed)
        .get(tvShowController.episode_details);
};