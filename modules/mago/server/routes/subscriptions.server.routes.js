'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    subscriptions = require(path.resolve('./modules/mago/server/controllers/subscription.server.controller'));

module.exports = function(app) {

    /* ===== subscriptions ===== */
    app.route('/api/subscriptions')
        .all(policy.isAllowed)
        .get(subscriptions.list)
        .post(subscriptions.create);

    app.route('/api/subscriptions/:subscriptionId')
        .all(policy.isAllowed)
        .get(subscriptions.read)
        .put(subscriptions.update)
        .delete(subscriptions.delete);

    app.param('subscriptionId', subscriptions.dataByID);

};
