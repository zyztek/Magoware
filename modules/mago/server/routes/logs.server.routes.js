var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    log = require(path.resolve('./modules/mago/server/controllers/logs.server.controller'));


module.exports = function(app) {

    /* ===== logs ===== */
    app.route('/api/logs')
        .get(log.list);

    app.route('/api/logs/:logId')
        .get(log.read);

    app.param('logId', log.dataByID);

};