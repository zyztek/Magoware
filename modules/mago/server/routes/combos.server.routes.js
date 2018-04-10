'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    combos = require(path.resolve('./modules/mago/server/controllers/combo.server.controller'));


module.exports = function(app) {

    /* ===== combos ===== */
    app.route('/api/combos')
        .get(combos.list);

    app.route('/api/combos')
        .all(policy.isAllowed)
        .post(combos.create);

	app.route('/api/combos/:comboId')
        .get(combos.read);

	app.route('/api/combos/:comboId')
        .all(policy.isAllowed)
        .put(combos.update)
        .delete(combos.delete);
    app.param('comboId', combos.dataByID);

};
