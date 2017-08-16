'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    authpolicy = require(path.resolve('./modules/deviceapiv2/server/auth/apiv2.server.auth.js')),
    tokenfunctions = require(path.resolve('./modules/streams/server/controllers/akamai.server.controller.js'));

module.exports = function(app) {

    app.route('/streams/getakamaitokenv2')
    //todo: remove comments to protect token calls
        //.all(authpolicy.isAllowed)
        .post(tokenfunctions.generate_akamai_token_v2);

};