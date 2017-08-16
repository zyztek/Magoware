'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    groups = require(path.resolve('./modules/mago/server/controllers/groups.server.controller'));


module.exports = function(app) {

    /* ===== groups ===== */
    app.route('/api/groups')
        .all(policy.isAllowed)
        .get(groups.list)
        .post(groups.create);

    app.route('/api/groups/:groupId')
        .all(policy.isAllowed)
        .get(groups.read)
        .put(groups.update)
        .delete(groups.delete);

    app.param('groupId', groups.dataByID);

};
