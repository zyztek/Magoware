'use strict';

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    deviceMenus = require(path.resolve('./modules/mago/server/controllers/device_menu.server.controller'));

module.exports = function(app) {
    /* ===== device menus ===== */
    app.route('/api/devicemenus')
        .all(policy.isAllowed)
        .get(deviceMenus.list)
        .post(deviceMenus.create);

    app.route('/api/devicemenus/:deviceMenuId')
        .all(policy.isAllowed)
        .get(deviceMenus.read)
        .put(deviceMenus.update)
        .delete(deviceMenus.delete);

    app.param('deviceMenuId', deviceMenus.dataByID);
};
