'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    packageVod = require(path.resolve('./modules/mago/server/controllers/package_vod.server.controller'));

module.exports = function(app) {


    /* ===== package channels ===== */
    app.route('/api/package_vod')
        //.all(policy.isAllowed) //todo: shtoje pastaj
        .get(packageVod.list)
        .post(packageVod.create);

    app.route('/api/package_vod/:packageChannelId')
        // .all(policy.isAllowed)
        // .get(packageChannels.read)
        // .put(packageChannels.update)
        .delete(packageVod.delete);
    /*
     app.param('packageChannelId', packageChannels.dataByID);
     */


};
