'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    authpolicy = require(path.resolve('./modules/deviceapiv2/server/auth/apiv2.server.auth.js')),
    tokenGenerators = require(path.resolve('./modules/streams/server/controllers/token_generators.server.controller.js')),
    catchupfunctions = require(path.resolve('./modules/streams/server/controllers/catchup_functions.server.controller.js'));

module.exports = function(app) {

    app.route('/apiv2/token/akamaitokenv2/*')

        //.all(authpolicy.isAllowed)
        .post(tokenGenerators.akamai_token_v2_generator);

    app.route('/apiv2/token/flussonic/*')
        //.all(authpolicy.isAllowed)
        .post(tokenGenerators.flussonic_token_generator);

    app.route('/apiv2/catchup/flussonic')
        .post(catchupfunctions.flussonic_catchup_stream);

};