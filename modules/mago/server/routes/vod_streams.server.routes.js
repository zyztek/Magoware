'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    vodStreams = require(path.resolve('./modules/mago/server/controllers/vod_stream.server.controller'));

module.exports = function(app) {


    /* ===== vod streams ===== */
    app.route('/api/vodstreams')
        .all(policy.isAllowed)
        .get(vodStreams.list)
        .post(vodStreams.create);

    app.route('/api/vodstreams/:vodStreamId')
        .all(policy.isAllowed)
        .get(vodStreams.read)
        .put(vodStreams.update)
        .delete(vodStreams.delete);

    app.param('vodStreamId', vodStreams.dataByID);


};
