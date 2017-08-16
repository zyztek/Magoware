'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    comboPackages = require(path.resolve('./modules/mago/server/controllers/combo_package.server.controller'));


module.exports = function(app) {

    /* ===== combo packages ===== */
    app.route('/api/combopackages')
        .all(policy.isAllowed)
        .get(comboPackages.list)
        .post(comboPackages.create);

    app.route('/api/combopackages/:comboPackageId')
        .all(policy.isAllowed)
        .get(comboPackages.read)
        .put(comboPackages.update)
        .delete(comboPackages.delete);

    app.param('comboPackageId', comboPackages.dataByID);

};
