'use strict'
var path = require('path'),
    response = require(path.resolve("./config/responses.js")),
    db = require(path.resolve('./config/lib/sequelize')).models,
    subscription_functions = require(path.resolve('./custom_functions/sales.js')),
    customer_functions = require(path.resolve('./custom_functions/customer_functions.js')),
    DBCombos = db.combo,
    DBpayment_transactions = db.payment_transactions,
    async = require('async'),
    whiteilst_IPs =['54.187.174.169',
                    '54.187.205.235',
                    '54.187.216.72',
                    '54.241.31.99',
                    '54.241.31.102',
                    '54.241.34.107'];

/*
* @api {get} /apiv2/payments/stripe/getkey Get Stripe Token Key
* @apiVersion 0.2.0
* @apiName Get Stripe Key
* @apiGroup DeviceAPI
*/
exports.stripe_get_key = function(req,res) {
    var thisresponse = new response.OK();
        thisresponse.response_object = [{
            stripekey:req.app.locals.paymenttokens.STRIPE.API_KEY
        }]
    res.send(thisresponse);
};



/**
 * @api {post} /apiv2/payments/stripe/charge Proccess Payment on Stripe
 * @apiVersion 0.2.0
 * @apiName Process Stripe Payment
 * @apiGroup DeviceAPI
 * @apiParam {String} auth AUTH Token.
 * @apiParam {Number} product_id  Mandatory field product_id.
 * @apiParam {String} username  Mandatory field user_id.
 * @apiParam {String} firstname  Mandatory field firstname.
 * @apiParam {String} lastname  Mandatory field lastname.
 * @apiParam {String} stripetoken  Mandatory field stripetoken.
 *
 * @apiSuccess (200) {String} message Record created successfuly
 * @apiError (40x) {String} message Error message on processign payment on stripe.
 *
 */

//stripe one off charge
exports.stripe_one_off_charge = function(req,res) {
    var thisresponse = new response.OK();
    var sale_or_refund = 1;


    if((!req.body.username && !req.body.email) || !req.body.product_id) {
        thisresponse.extra_data = "Missing username or product ID.";
        res.status(400).send("Missing email or product ID.");
        return null;
    }

    if(!req.body.username) req.body.username = req.body.email;

    var stripeobj = {
        amount: 1,
        currency: "usd",
        //description: "Example charge",
        //statement_descriptor: "Descriptor 22char",
        metadata: {Firstname: req.body.firstname, Lastname: req.body.lastname, product_id: req.body.product_id, username:req.body.username},
        source: req.body.stripetoken
    };

    DBCombos.findOne({
        where: {product_id:req.body.product_id}
    }).then(function (result) {

        if(!result) {
            thisresponse.error_code = 400;
            thisresponse.extra_data = "Plan not found on database";
            res.send(thisresponse);
        } else {
            stripeobj.amount = result.dataValues.value;

            stripe.charges.create(stripeobj, function(err, charge) {
                if(err) {
                    //payment failed
                    thisresponse.status_code = err.statusCode;
                    thisresponse.error_code = err.statusCode;
                    thisresponse.error_description = err.message;
                    thisresponse.extra_data = err.message;
                    thisresponse.response_object = err;
                    res.send(thisresponse);
                }
                else {
                    //payment successful
                    thisresponse.response_object = charge;
                    thisresponse.extra_data = charge.outcome.seller_message;
                    res.send(thisresponse);
                }
            });
            return null;
        }
    }).catch(function(error) {
       console.log(error);
    });
};

//stripe subscription charge
exports.stripe_subscription_charge = function(req,res) {
    var thisresponse = new response.OK();
    var stripe = require("stripe")(req.app.locals.paymenttokens.STRIPE.API_KEY);
    var sale_or_refund = 1;

    if((!req.body.username && !req.body.email) || !req.body.product_id) {
        thisresponse.extra_data = "Missing username or product ID.";
        res.status(400).send("Missing email or product ID.");
        return null;
    }

    if(!req.body.username) req.body.username = req.body.email;


    DBCombos.findOne({
        where: {procut_id:req.body.product_id}
    }).then(function (result) {

        if(!result) {
            thisresponse.error_code = 400;
            thisresponse.extra_data = "Subscription plan not found on database";
            res.send(thisresponse);
        } else {

            stripe.customers.create({
                    email: req.body.email,
                    source: req.body.stripetoken,
                    metadata: {firstname: req.body.firstname, lastname: req.body.lastname, email:req.body.email},
                },
                function(err, customer) {
                    if (err) {
                        thisresponse.error_description = err.message;
                        thisresponse.extra_data = err.type;
                        thisresponse.response_object = err;
                        res.send(thisresponse);
                    }
                    else {
                        stripe.subscriptions.create({
                                customer: customer.id,
                                items: [
                                   {
                                     plan: req.body.product_id
                                   }
                                ],
                                metadata: {
                                    firstname: req.body.firstname,
                                    lastname: req.body.lastname,
                                    product_id: req.body.product_id,
                                    username: req.body.username
                                }
                            }, function (err, subscription) {
                                if (subscription) {
                                    thisresponse.extra_data = subscription.id;
                                    thisresponse.response_object = subscription;
                                    res.send(thisresponse);
                                }
                                else {
                                    thisresponse.response_object = err;
                                    thisresponse.status_code = err.statusCode;
                                    thisresponse.error_code = err.statusCode;
                                    thisresponse.error_description = err.message;
                                    thisresponse.extra_data = err.message;
                                    res.send(thisresponse);
                                }
                            }
                        );
                    }
                }
            );
        return null;
        }
    }).catch(function(error) {
        console.log('some error',error);
    });

};


//incoming webhook from stripe
exports.stripe_add_subscription = function(req,res) {

    var stripe = require("stripe")(req.app.locals.paymenttokens.STRIPE.API_KEY);
    var transaction_id = req.body.data.object.id;
    var stripeinvoiceid = req.body.data.object.invoice; //
    var sale_or_refund = 1; //sale
    var transaction_object = {};
        transaction_object.transaction_id = req.body.id;
        transaction_object.transaction_type = req.body.type;
        transaction_object.transaction_token = req.body.data.object.source.id;
        transaction_object.refunds_info = req.body.data.object.refunds.url;
        transaction_object.message = req.body.data.object.outcome.seller_message;
        transaction_object.payment_provider = 'stripe';
        transaction_object.date = Date.now();
        transaction_object.full_log = JSON.stringify(req.body);
        transaction_object.amount = req.body.data.object.amount;
        transaction_object.payment_success = true;

    async.waterfall([
        function(callback) {
            //if invoice available then it is a subscription
            if (stripeinvoiceid) {
                stripe.invoices.retrieve(
                    stripeinvoiceid,
                    function (err, invoice) {
                        if (invoice) {
                            if(!invoice.lines.data[0].metadata.username) {
                                stripe.customers.retrieve(
                                    invoice.customer,
                                    function (err, customer) {
                                        if (customer) {
                                            req.body.username = customer.email;
                                            req.body.product_id = invoice.lines.data[0].plan.id;
                                            callback(null,{status:true});
                                        }
                                        else {
                                            callback(null,{status:false, message:"customer not found"});
                                        }
                                    }
                                );
                            }
                            else {
                                req.body.username = invoice.lines.data[0].metadata.username;
                                req.body.product_id = invoice.lines.data[0].plan.id;
                                callback(null,{status:true});
                            }
                        }
                        else {
                            callback(null,{status:false, message:"invoice not found"});
                        }
                    }
                );
            }
            //else it is a one off charge
            else {
                req.body.username = req.body.data.object.metadata.username;
                req.body.product_id = req.body.data.object.metadata.product_id;
                callback({status:true},callback);
            }
        },
        //create or find login account
        function (result,callback) {
            if(result.status) {
                customer_functions.create_login_data(req, res, req.body.username).then(function (value) {
                    callback(null, value);
                })
            }
            else {
                callback(null, result);
            }

        }

    ], function (err, result) {
        console.log(err,result);
        if(result.status) {
            subscription_functions.add_subscription_transaction(req, res, sale_or_refund, transaction_id).then(function(result) {
                if (result.status) {
                    res.send(result);

                    //enter record into database regardless of results
                    transaction_object.customer_username = req.body.username;
                    transaction_object.product_id = req.body.product_id;
                    DBpayment_transactions.upsert(transaction_object)
                        .then(function (result) {
                            //
                        }).catch(function (err) {
                        console.error(err);
                    });
                }
                else {
                    res.status(300).send(result);
                }
            });
        }
        else{
            res.status(300).send(result);
        }


    });
};

//incoming refund webhook from stripe
exports.stripe_refund = function(req,res) {
    var sale_or_refund = -1;
    var transaction_id = req.body.data.object.id;

    var transaction_object = {};
        transaction_object.transaction_id = req.body.id;
        transaction_object.transaction_type = req.body.type;
        transaction_object.transaction_token = req.body.data.object.source.id;
        transaction_object.refunds_info = req.body.data.object.refunds.url;
        transaction_object.message = req.body.data.object.outcome.seller_message;
        transaction_object.payment_provider = 'stripe';
        transaction_object.date = Date.now();
        transaction_object.full_log = JSON.stringify(req.body);
        transaction_object.amount = req.body.data.object.amount_refunded;
        transaction_object.payment_success = true;
        transaction_object.customer_username = req.body.data.object.metadata.username;
        transaction_object.product_id = req.body.data.object.metadata.product_id;

    db.salesreport.findOne({
        where: {transaction_id: transaction_id}
    }).then(function(salesrecord) {
        if(!salesrecord) {
            res.status(300).json({received: false})
        }
        else {
            req.body.product_id = req.body.data.object.metadata.product_id;
            req.body.login_data_id = salesrecord.login_data_id;

            subscription_functions.add_subscription_transaction(req,res,sale_or_refund,transaction_id).then(function(result) {
                if(result.status) {
                    res.status(200).send(result)
                }
                else {
                    res.status(300).send(result)
                }
            });
        }
    });

    //enter record into database regardless of results
    DBpayment_transactions.upsert(transaction_object)
        .then(function (result) {
            //console.log('*************** refund result :',result);
        }).catch(function (err) {
        // That's what really happens
        console.error(err);
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

// not in use yet
exports.stripe_order_charge = function (req,res) {
    var stripe = require('stripe')('sk_test_Z4OH3P3t6XXwInfSUAnk2t0y');
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

    var stripeobject = {
        currency: "usd",
        email: req.body.email,
        metadata: {Firstname: req.body.firstname, Lastname: req.body.lastname, product_id: req.body.product_id, username:req.body.username},
        items: [{
            type: 'sku',
            parent: req.body.product_id,
            quantity: 1
        }]
    };

    stripe.orders.create(
            stripeobject
        , function(err, order) {
        if(order) {
            stripe.orders.pay(order.id, {
                source: req.body.stripetoken
            }, function(err, orderstatus) {
                if(orderstatus)
                    res.send(orderstatus);
                else
                    res.send(err);
            });
        }
        else {
            res.send(err);
        }
    });
};