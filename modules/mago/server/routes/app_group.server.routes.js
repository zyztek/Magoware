'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    appgr = require(path.resolve('./modules/mago/server/controllers/app_group.server.controller'));

module.exports = function(app) {
    /* ===== device menus ===== */
    app.route('/api/appgroup')
        .get(appgr.list)
        .post(appgr.create);

    app.route('/api/appgroup/:appgroupID')
        .get(appgr.read)
        .put(appgr.update)
        .delete(appgr.delete);

    app.param('appgroupID', appgr.dataByID);
};
