'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    emailTemplates = require(path.resolve('./modules/mago/server/controllers/email_templates.server.controller'));

module.exports = function(app) {
    /* ===== device menus ===== */
    app.route('/api/emailtemplate')
        .all(policy.isAllowed)
        .get(emailTemplates.list)
        .post(emailTemplates.create);

    app.route('/api/emailtemplate/:emailTemplatesId')
        .all(policy.isAllowed)
        .get(emailTemplates.read)
        .put(emailTemplates.update)
        .delete(emailTemplates.delete);

    app.param('emailTemplatesId', emailTemplates.dataByID);
};
