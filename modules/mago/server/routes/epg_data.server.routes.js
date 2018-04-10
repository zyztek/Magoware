'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    epgData = require(path.resolve('./modules/mago/server/controllers/epg_data.server.controller'));


module.exports = function(app) {

    /* ===== epg data ===== */

    app.route('/api/epgdata1')
        .post(epgData.create_sample);

    app.route('/api/epgdata')
        .all(policy.isAllowed)
        .get(epgData.list)
        .post(epgData.create);

    app.route('/api/epgdata_chart')
        //.all(policy.isAllowed)
        .get(epgData.list_chart_epg);

    app.route('/api/epgimport')
        .get(epgData.epg_import)
        .post(epgData.save_epg_records);

    app.route('/api/epgdata/:epgDataId')
        .all(policy.isAllowed)
        .get(epgData.read)
        .put(epgData.update)
        .delete(epgData.delete);

    app.param('epgDataId', epgData.dataByID);


};
