'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    customController = require(path.resolve('./modules/mago/server/controllers/_custom_controller.server.controller'));


module.exports = function(app) {
    /* ===== customer data ===== */
    //app.route('/api/customerdata')
    //    .get(customerData.list);

    //transaction based function to creates customer and login data both at the same time.
    app.route('/api/NewCustomer')
    //.all(policy.isAllowed)
        .post(customController.create_customer_with_login);

    app.route('/api/createcustomerlogin')
        //.all(policy.isAllowed)
        .post(customController.create_customer_with_login);

    app.route('/api/accountslist')
        //.all(policy.isAllowed)
        .get(customController.list_logins_with_customer);


    app.route('/api/upsertsubscription')
        .all(policy.isAllowed)
        .post(customController.insert_or_update_user_subscription);

};
