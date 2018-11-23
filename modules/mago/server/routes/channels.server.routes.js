'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    channels = require(path.resolve('./modules/mago/server/controllers/channels.server.controller'));


module.exports = function(app) {

    /* ===== channels ===== */
    app.route('/api/channels')
        .all(policy.isAllowed)
        .get(channels.list);

    app.route('/api/channels')
        .all(policy.isAllowed)
        .post(channels.create);

    app.route('/api/channels/:channelId')
        .all(policy.isAllowed)
        .get(channels.read)
        .put(channels.update)
        .delete(channels.delete);

    app.param('channelId', channels.dataByID);


};