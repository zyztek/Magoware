'use strict';

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    Submenu = require(path.resolve('./modules/mago/server/controllers/device_menu_level2.server.controller'));

module.exports = function(app) {
    /* ===== device menus ===== */
    app.route('/api/Submenu')
        .all(policy.isAllowed)
        .get(Submenu.list)
        .post(Submenu.create);

    app.route('/api/Submenu/:SubmenuId')
        .all(policy.isAllowed)
        .get(Submenu.read)
        .put(Submenu.update)
        .delete(Submenu.delete);

    app.param('SubmenuId', Submenu.dataByID);
};
