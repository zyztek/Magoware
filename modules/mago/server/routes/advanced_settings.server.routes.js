'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    advancedSettings = require(path.resolve('./modules/mago/server/controllers/advanced_settings.server.controller'));

module.exports = function(app) {
    /* ===== device menus ===== */
    app.route('/api/AdvancedSettings')
        .all(policy.isAllowed)
        .get(advancedSettings.list)
        .post(advancedSettings.create);

    app.route('/api/AdvancedSettings/:AdvancedSettingsId')
        .all(policy.isAllowed)
        .get(advancedSettings.read)
        .put(advancedSettings.update)
        .delete(advancedSettings.delete);

    app.param('AdvancedSettingsId', advancedSettings.dataByID);
};