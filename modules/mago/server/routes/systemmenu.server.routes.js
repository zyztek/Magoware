'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    systemmenu = require(path.resolve('./modules/mago/server/controllers/systemmenu.server.controller'));


module.exports = function(app) {

    app.route('/api/systemmenu1')
        //.all(policy.isAllowed)
        .get(systemmenu.list1);

    /* ===== system menu ===== */
    app.route('/api/systemmenu')
        //.all(policy.isAllowed)
        .get(systemmenu.list)
        .post(systemmenu.create);

    app.route('/api/systemmenu/:systemmenuId')
        //.all(policy.isAllowed)
        .get(systemmenu.read)
        .put(systemmenu.update)
        .delete(systemmenu.delete);

    app.param('systemmenuId', systemmenu.dataByID);
};
