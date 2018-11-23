'use strict';

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    vodmenucarousel = require(path.resolve('./modules/mago/server/controllers/vod_menu_carousel.server.controller'));

module.exports = function(app) {
    /* ===== vod menus ===== */
    app.route('/api/vodmenucarousel')
        .all(policy.isAllowed)
        .get(vodmenucarousel.list)
        .post(vodmenucarousel.create);

    app.route('/api/vodmenucarousel/:vodmenucarouselId')
        .all(policy.isAllowed)
        .get(vodmenucarousel.read)
        .put(vodmenucarousel.update)
        .delete(vodmenucarousel.delete);

    app.param('vodmenucarouselId', vodmenucarousel.dataByID);
};