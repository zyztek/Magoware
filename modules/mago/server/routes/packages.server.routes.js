'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    packages = require(path.resolve('./modules/mago/server/controllers/package.server.controller'));


module.exports = function(app) {

    /* ===== packages ===== */
    app.route('/api/packages')
        .all(policy.isAllowed)
        .get(packages.list)
        .post(packages.create);

    app.route('/api/vodpackages')
        .all(policy.isAllowed)
        .get(packages.list)
        .post(packages.create);

    app.route('/api/packages/:packageId')
        .all(policy.isAllowed)
        .get(packages.read)
        .put(packages.update)
        .delete(packages.delete);

    app.route('/api/vodpackages/:packageId')
        .all(policy.isAllowed)
        .get(packages.read)
        .put(packages.update)
        .delete(packages.delete);

    app.param('packageId', packages.dataByID);

};
