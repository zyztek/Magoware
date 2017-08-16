'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    channelStreamSources = require(path.resolve('./modules/mago/server/controllers/channel_stream_source.server.controller'));


module.exports = function(app) {


    /* ===== channel stream sources ===== */
    app.route('/api/channelstreamsources')
        .all(policy.isAllowed)
        .get(channelStreamSources.list)
        .post(channelStreamSources.create);

    app.route('/api/channelstreamsources/:channelStreamSourceId')
        .all(policy.isAllowed)
        .get(channelStreamSources.read)
        .put(channelStreamSources.update)
        .delete(channelStreamSources.delete);

    app.param('channelStreamSourceId', channelStreamSources.dataByID);


};
