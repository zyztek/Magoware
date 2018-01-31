'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    grouprights = require(path.resolve('./modules/mago/server/controllers/grouprights.server.controller'));


module.exports = function(app) {

    /* ===== groups ===== */
    app.route('/api/grouprights')
        //.all(policy.isAllowed)
        .get(grouprights.list)
        .put(grouprights.update)
        .post(grouprights.create);

    app.route('/api/grouprights/:grouprightsId')
        //.all(policy.isAllowed)
        .get(grouprights.read)
        .put(grouprights.update);
    //.delete(groups.delete);

    app.param('grouprightsId', grouprights.dataByID);

};
