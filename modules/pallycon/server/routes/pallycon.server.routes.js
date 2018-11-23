'use strict';
var path = require('path');
var pallyconController = require(path.resolve('./modules/pallycon/server/controllers/pallycon.server.controller'));

module.exports = function(app) {
    app.route('/apiv2/pallycon/CIDIssue')
        .post(pallyconController.handleCIDIssue);

    app.route('/apiv2/pallycon/ContentUsageRightsInfo')
        .post(pallyconController.handleContentUsageRightInfo);

}