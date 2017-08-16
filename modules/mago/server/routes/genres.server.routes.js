'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    genres = require(path.resolve('./modules/mago/server/controllers/genre.server.controller'));


module.exports = function(app) {

    /* ===== genres ===== */
    app.route('/api/genres')
        .all(policy.isAllowed)
        .get(genres.list)
        .post(genres.create);

    app.route('/api/genres/:genreId')
        .all(policy.isAllowed)
        .get(genres.read)
        .put(genres.update)
        .delete(genres.delete);

    app.param('genreId', genres.dataByID);

};
