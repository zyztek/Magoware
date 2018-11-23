'use strict';

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    vodmenu = require(path.resolve('./modules/mago/server/controllers/vod_menu.server.controller'));

module.exports = function(app) {
    /* ===== vod menus ===== */
    app.route('/api/vodmenu')
        .all(policy.isAllowed)
        .get(vodmenu.list)
        .post(vodmenu.create);

    app.route('/api/vodmenu/:vodmenuId')
        .all(policy.isAllowed)
        .get(vodmenu.read)
        .put(vodmenu.update)
        .delete(vodmenu.delete);

    app.param('vodmenuId', vodmenu.dataByID);
};