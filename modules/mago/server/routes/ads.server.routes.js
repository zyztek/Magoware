'use strict';

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    ads = require(path.resolve('./modules/mago/server/controllers/ads.server.controller'));


module.exports = function(app) {

    //todo: per keto routes dhe per push te tjera, permission????
    app.route('/api/ads')
        .get(ads.list)
        .post(ads.create);
};
