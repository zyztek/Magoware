'use strict'
var path = require('path'),
    response = require(path.resolve("./config/responses.js")),
    stripe = require('stripe')('sk_test_Z4OH3P3t6XXwInfSUAnk2t0y'),

    db = require(path.resolve('./config/lib/sequelize')).models,
    subscription_functions = require(path.resolve('./custom_functions/sales.js')),
    customer_functions = require(path.resolve('./custom_functions/customer_functions.js')),
    //DBCombos = db.combo,
    DBModel = db.payment_transactions;



/**
 * @api {post} /apiv2/payments/stripe/charge Proccess Payment on Stripe
 * @apiVersion 0.2.0
 * @apiName Process Stripe Payment
 * @apiGroup Device API
 * @apiParam {String} auth AUTH Token.
 * @apiParam {Number} product_id  Mandatory field product_id.
 * @apiParam {String} user_id  Mandatory field user_id.
 * @apiParam {String} firstname  Mandatory field firstname.
 * @apiParam {String} lastname  Mandatory field lastname.
 * @apiParam {String} stripetoken  Mandatory field stripetoken.
 *
 * @apiSuccess (200) {String} message Record created successfuly
 * @apiError (40x) {String} message Error message on processign payment on stripe.
 *
 */

exports.stripe_charge = function(req,res) {
    var thisresponse = new response.OK();
    var sale_or_refund = 1;

    if(!req.body.username || !req.body.product_id) {
        thisresponse.extra_data = "Missing username or product ID.";
        res.status(400).send("Missing username or product ID.");
        return null;
    }

    var myobj  = {
        date : Date.now(),
        payment_provider : 'stripe',
        customer_username: req.body.username,
        product_id: req.body.product_id,
        transaction_token: req.body.stripetoken
    };

    var stripeobj = {
        amount: 1000,
        currency: "usd",
        description: "Example charge",
        statement_descriptor: "Descriptor 22char",
        metadata: {Firstname: req.body.firstname, Lastname: req.body.lastname, Product: "some test product"},
        source: req.body.stripetoken
    };

    myobj.amount = stripeobj.amount = 99;//req.body.amount;

    //if(customer_functions.create_login_data(req,res,req.body.user_id)) {
    customer_functions.create_login_data(req,res,req.body.username).then(function(value){
        if(value.status) {
                //user found or created. Start payment process
                stripe.charges.create(stripeobj, function(err, charge) {
                    if(err) {
                        //payment failed
                        myobj.transaction_id = err.requestId;
                        myobj.message = err.type;
                        myobj.payment_success = false;
                        myobj.refunds_info = err.message;
                        myobj.full_log = JSON.stringify(err);
                        thisresponse.status_code = err.statusCode;
                        thisresponse.error_code = err.statusCode;
                        thisresponse.error_description = err.message;
                        thisresponse.extra_data = err.message;
                        DBModel.create(myobj); //insert record
                        res.status(400).send(thisresponse);
                    }
                    else {
                        //payment successful
                        myobj.transaction_id = charge.id;
                        myobj.message = charge.outcome.seller_message;
                        myobj.payment_status = charge.outcome.type;
                        myobj.payment_success = true;
                        myobj.refunds_info = charge.refunds.url;
                        myobj.full_log = JSON.stringify(charge);
                        DBModel.create(myobj); //insert payment log into database
                        thisresponse.extra_data = charge.outcome.seller_message;

                        subscription_functions.add_subscription_transaction(req,res,sale_or_refund,myobj.transaction_id).then(function(value) {
                            if(value.status) {
                                thisresponse.extra_data = value.message;
                                res.send(thisresponse);
                            }
                            else {
                                thisresponse.extra_data = value.message;
                                thisresponse.status_code = 400;
                                res.status(400).send(thisresponse);
                            }
                        });
                    }
                });
            }
            else {
                    thisresponse.error_code = 400;
                    thisresponse.extra_data = value.message; //"There was an error creating username. ";
                    //console.log('login data not created');
                    res.status(400).send(thisresponse);
            }
    })
};


exports.stripe_refund = function(req,res) {
    const endpointSecret = "whsec_3j1DXYo5wvw5DsCDnTZZKQqOWhTd4Koi";
    var sig = req.headers["stripe-signature"];
    var sale_or_refund = -1;
    var thisresponse = new response.OK();
    //var transaction_id = "ch_1Bq8mnKfcj7pVCd6SBuE5L9l"; //req.body.data.object.refunds.data.charge;
    var transaction_id = req.body.data.object.id;
    console.log(req.body.data.object.refunds);


    db.salesreport.findOne({
        where: {transaction_id: transaction_id}
    }).then(function(salesrecord) {
        if(!salesrecord) {
            res.json({received: false})
        }
        else {
            req.body.product_id = salesrecord.combo_id;
            req.body.login_data_id = salesrecord.login_data_id;

            subscription_functions.add_subscription_transaction(req,res,sale_or_refund,transaction_id).then(function(value) {
                if(value.status) {
                    //thisresponse.extra_data = value.message;
                    //res.send(thisresponse);
                    res.json({received: true});

                }
                else {
                    //thisresponse.extra_data = value.message;
                    //thisresponse.status_code = 400;
                    //res.status(400).send(thisresponse);
                    res.json({received: false});
                }
            });
        }
    });
};


exports.render_payment_form = function(req,res) {

    db.combo.findAll({
        where: {isavailable: 1}
    }).then(function (combos) {

        for (var i = 0, len = combos.length; i < len; i++) {
            //optionsrow += '<option value ="' + combos[i].dataValues.value + '">' + combos[i].dataValues.name + ' - ' + combos[i].dataValues.value + '</option>';
        }

        res.render(path.resolve('modules/paymentgateways/server/templates/stripe-checkout-form'), {
            //options: '<option value="volvo">Volvo</option>', //req.body.name,
            email: 'myemail@email', //req.body.email,
            message: 'req.body.message',
            subject: 'req.body.subject'
        });
    });
};

