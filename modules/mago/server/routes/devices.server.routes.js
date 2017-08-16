'use strict';

var path = require('path'),
    policy = require('../policies/mago.server.policy'),
    devices = require(path.resolve('./modules/mago/server/controllers/devices.server.controller'));


module.exports = function(app) {

    /* ===== devices ===== */
    app.route('/api/devices')
        .get(devices.list);

    app.route('/api/devices')
        .all(policy.isAllowed)
        .post(devices.create);

    app.route('/api/devices/:deviceId')
        .all(policy.isAllowed)
        .get(devices.read)
        .put(devices.update)
        .delete(devices.delete);

    app.param('deviceId', devices.dataByID);

};