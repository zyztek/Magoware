'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    authpolicy = require(path.resolve('./modules/deviceapiv2/server/auth/apiv2.server.auth.js')),
    wooFunctions = require(path.resolve('./modules/woocommerce/server/controllers/woocommerce.server.controller.js'));


module.exports = function(app) {

    //woocommerce webhook order status complete
    app.route('/apiv2/woocommerce/order_status_change')
       .all(authpolicy.isAllowed)
       .post(wooFunctions.woocommerce_order_status_change);
}