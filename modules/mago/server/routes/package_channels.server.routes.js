'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    packageChannels = require(path.resolve('./modules/mago/server/controllers/package_channel.server.controller'));

module.exports = function(app) {


    /* ===== package channels ===== */
    app.route('/api/packagechannels')
        .all(policy.isAllowed)
        .get(packageChannels.list)
        .post(packageChannels.create);

    app.route('/api/packagechannels/:packageChannelId')
        .all(policy.isAllowed)
        .get(packageChannels.read)
        .put(packageChannels.update)
        .delete(packageChannels.delete);

    app.param('packageChannelId', packageChannels.dataByID);


};
