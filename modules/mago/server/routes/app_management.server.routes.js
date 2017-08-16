'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    appManagement = require(path.resolve('./modules/mago/server/controllers/app_management.server.controller'));

module.exports = function(app) {
    /* ===== device menus ===== */
    app.route('/api/appmanagement')
        .all(policy.isAllowed)
        .get(appManagement.list)
        .post(appManagement.create);

    app.route('/api/appmanagement/:appManagementId')
        .all(policy.isAllowed)
        .get(appManagement.read)
        .put(appManagement.update)
        .delete(appManagement.delete);

    app.param('appManagementId', appManagement.dataByID);
};
