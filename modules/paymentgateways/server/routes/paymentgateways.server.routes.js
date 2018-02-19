'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    deviceauthpolicy = require(path.resolve('./modules/deviceapiv2/server/auth/apiv2.server.auth.js')),
    backendwuthpolicy = require(path.resolve('./modules/mago/server/policies/mago.server.policy.js')),
    stripeFunctions = require(path.resolve('./modules/paymentgateways/server/controllers/stripe_functions.server.controller.js'));


module.exports = function(app) {

    app.route('/apiv2/payments/stripe/getkey')
        //.all(authpolicy.isAllowed)
        .get(stripeFunctions.stripe_get_key);

    app.route('/apiv2/payments/stripe/charge')
        //.all(authpolicy.isAllowed)
        .post(stripeFunctions.stripe_charge);

    app.route('/apiv2/payments/stripe/chargeorder')
        //.all(authpolicy.isAllowed)
        .post(stripeFunctions.stripe_order_charge);

    app.route('/apiv2/payments/stripe/addsubscription')
        //.all(authpolicy.isAllowed)
        .post(stripeFunctions.stripe_add_subscription);

    app.route('/apiv2/payments/stripe/refund')
        //.all(authpolicy.isAllowed)
        .post(stripeFunctions.stripe_refund);

    app.route('/apiv2/payments/stripe/form')
        //.all(authpolicy.isAllowed)
        .all(stripeFunctions.render_payment_form);

};