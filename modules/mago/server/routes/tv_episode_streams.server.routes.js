'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    tv_episodeStreams = require(path.resolve('./modules/mago/server/controllers/tv_episode_streams.server.controller'));

module.exports = function(app) {


    /* ===== tv episode streams ===== */
    app.route('/api/tv_episode_stream')
        .all(policy.isAllowed)
        .get(tv_episodeStreams.list)
        .post(tv_episodeStreams.create);

    app.route('/api/tv_episode_stream/:tv_episode_stream_id')
        .all(policy.isAllowed)
        .get(tv_episodeStreams.read)
        .put(tv_episodeStreams.update)
        .delete(tv_episodeStreams.delete);

    app.param('tv_episode_stream_id', tv_episodeStreams.dataByID);


};
