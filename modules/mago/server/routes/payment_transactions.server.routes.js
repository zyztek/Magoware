'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    paymentTransactions = require(path.resolve('./modules/mago/server/controllers/payment_transactions.server.controller'));


module.exports = function(app) {

    /* ===== Payment Transactions ===== */
    app.route('/api/PaymentTransactions')
        //.all(policy.isAllowed)
        .get(paymentTransactions.list);

    app.route('/api/PaymentTransactions/:PaymentTransactionID')
        //.all(policy.isAllowed)
        .get(paymentTransactions.read);

    app.param('PaymentTransactionID', paymentTransactions.dataByID);

};
