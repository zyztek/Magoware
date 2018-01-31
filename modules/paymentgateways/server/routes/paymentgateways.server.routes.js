'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    authpolicy = require(path.resolve('./modules/deviceapiv2/server/auth/apiv2.server.auth.js')),
    stripeFunctions = require(path.resolve('./modules/paymentgateways/server/controllers/stripe_functions.server.controller.js'));


module.exports = function(app) {

/*=================== encryption api URLs =================== */

    app.route('/apiv2/payments/stripe/charge')
        //.all(authpolicy.isAllowed)
        .post(stripeFunctions.stripe_charge);

    app.route('/apiv2/payments/stripe/refund')
        //.all(authpolicy.isAllowed)
        .post(stripeFunctions.stripe_refund);

    app.route('/apiv2/payments/stripe/form')
        //.all(authpolicy.isAllowed)
        .all(stripeFunctions.render_payment_form);



};