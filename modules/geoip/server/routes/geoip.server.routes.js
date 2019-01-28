'use strict'

var path = require('path'),
    geoipLogic = require(path.resolve('./modules/geoip/server/controllers/geoip_logic.server.controller'));

module.exports = function(app) {
    app.route('/apiv2/geoip/')
        .get(geoipLogic.handleGetIPData);
    app.route('/apiv2/geoip/update')
        .post(geoipLogic.handleDownloadDatabase);
    app.route('/apiv2/geoip/status')
        .post(geoipLogic.handleDatabaseStatus);
}