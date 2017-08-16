'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    customerGroups = require(path.resolve('./modules/mago/server/controllers/customer_group.server.controller'));


module.exports = function(app) {

    /* ===== customer groups ===== */
    app.route('/api/customergroups')
        .all(policy.isAllowed)
        .get(customerGroups.list)
        .post(customerGroups.create);

    app.route('/api/customergroups/:customerGroupId')
        .all(policy.isAllowed)
        .get(customerGroups.read)
        .put(customerGroups.update)
        .delete(customerGroups.delete);

    app.param('customerGroupId', customerGroups.dataByID);
};
