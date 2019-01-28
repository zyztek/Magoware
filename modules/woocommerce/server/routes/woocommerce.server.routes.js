'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    policy = require(path.resolve('./modules/mago/server/policies/mago.server.policy')),
//    policy = require('../policies/mago.server.policy'),
    wooFunctions = require(path.resolve('./modules/woocommerce/server/controllers/woocommerce.server.controller.js'));


module.exports = function(app) {

    //woocommerce webhook order status complete
    app.route('/apiv2/woocommerce/order_status_change')
        .all(policy.isApiKeyAllowed)
        .post(wooFunctions.woocommerce_order_status_change);
}