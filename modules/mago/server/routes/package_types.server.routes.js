'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    packageTypes = require(path.resolve('./modules/mago/server/controllers/package_type.server.controller'));

module.exports = function(app) {


    /* ===== package types ===== */
    app.route('/api/packagetypes')
        .all(policy.isAllowed)
        .get(packageTypes.list)
        .post(packageTypes.create);

    app.route('/api/packagetypes/:packageTypeId')
        .all(policy.isAllowed)
        .get(packageTypes.read)
        .put(packageTypes.update)
        .delete(packageTypes.delete);

    app.param('packageTypeId', packageTypes.dataByID);


};
