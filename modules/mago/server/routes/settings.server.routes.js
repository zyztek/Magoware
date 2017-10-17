'use strict';
var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    settings = require(path.resolve('./modules/mago/server/controllers/settings.server.controller'));

module.exports = function(app) {

    /* ===== settings ===== */
    app.route('/api/settings')
        .all(policy.isAllowed)
        .get(settings.list);

    app.route('/api/settings/:settingId')
        .all(policy.isAllowed)
        .get(settings.read)
        .put(settings.update);

    app.param('settingId', settings.dataByID);

    app.route('/api/env_settings').get(settings.env_settings);

};