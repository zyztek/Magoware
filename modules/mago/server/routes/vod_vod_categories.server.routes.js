'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    vod_vod_categories = require(path.resolve('./modules/mago/server/controllers/vod_vod_categories.server.controller'));

module.exports = function(app) {


    /* ===== package channels ===== */
    app.route('/api/packagechannels')
        .all(policy.isAllowed)
        .get(vod_vod_categories.list)
        .post(vod_vod_categories.create);

    app.route('/api/packagechannels/:packageChannelId')
        .all(policy.isAllowed)
        .get(vod_vod_categories.read)
        .put(vod_vod_categories.update)
        .delete(vod_vod_categories.delete);

    app.param('packageChannelId', vod_vod_categories.dataByID);


};

