'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    channelStreams = require(path.resolve('./modules/mago/server/controllers/channel_stream.server.controller'));


module.exports = function(app) {

    /* ===== channel streams ===== */
    app.route('/api/channelstreams')
        .all(policy.isAllowed)
        .get(channelStreams.list)
        .post(channelStreams.create);

    app.route('/api/channelstreams/:channelStreamId')
        .all(policy.isAllowed)
        .get(channelStreams.read)
        .put(channelStreams.update)
        .delete(channelStreams.delete);

    app.param('channelStreamId', channelStreams.dataByID);


};
