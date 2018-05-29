'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    subscription_functions = require(path.resolve('./custom_functions/sales.js')),
    customerFunctions = require(path.resolve('./custom_functions/customer_functions.js')),
    responses = require(path.resolve("./config/responses.js")),
    db = require(path.resolve('./config/lib/sequelize')).models,
    db_t = require(path.resolve('./config/lib/sequelize'));



/**
 * @api {post} /api/customerdata Create Customer
 * @apiVersion 0.2.0
 * @apiName Create Customer
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {Number} group_id  Mandatory field group_id.
 * @apiParam {String} firstname  Mandatory field firstname.
 * @apiParam {String} lastname  Mandatory field lastname.
 * @apiParam {String} email  Mandatory field email.
 * @apiParam {String} address  Mandatory field address.
 * @apiParam {String} city  Mandatory field city.
 * @apiParam {String} country  Mandatory field country.
 * @apiParam {String} telephone  Mandatory field telephone.
 * @apiSuccess (200) {String} message Record created successfuly
 * @apiError (40x) {String} message Error message on creating customer data.
 */


exports.create_customer_with_login = function(req,res) {
    if((req.body.username) && (req.body.email)) {
        req.body.username = req.body.username.toLowerCase();
        req.body.email = req.body.email.toLowerCase();

        customerFunctions.create_customer_with_login(req,res).then(function(data) {
            if(data.status) {
                res.send(data.message);
            }
            else {
                res.status(400).send(data.message);
            }
        });
    }
    else {
        res.status(400).send("Email address or Username can not be blank.");
        return null
    }

};


exports.list_logins_with_customer = function(req,res) {
    db.login_data.findAll({
        attributes: ['id','username','createdAt'],
        include: [
            { model: db.customer_data,
                attributes:['firstname','lastname','email','telephone','address','city','country'],
                required: true}
        ],
        limit: 100,
        order: 'id desc',
        raw: true
    }
    ).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {
            res.json(results);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};


/**
 * @api {post} /api/upsertsubscription Insert or updated subscription status
 * @apiVersion 0.2.0
 * @apiName Upsert Subscription
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {string} username  Mandatory field username
 * @apiParam {number} product_id  Mandatory field product_id.
 * apiParam  {number} sale_or_refund If it is a sale or refund, 1 or -1.
 * @apiParam {date} start_date  Optional field, if missing todays date is used.
 * @apiParam {date} end_date  Option field, if missing start_date + product.duration is used.
 * @apiParam {String} transaction_id  Optional field, payment transation id. If missing random number is used.
 * @apiSuccess (200) {String} message Transaction executed successfuly
 * @apiError (40x) {String} message Error message on transaction.
 */

exports.insert_or_update_user_subscription = function(req,res) {

    var sale_or_refund = req.body.sale_or_refund;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var transaction_id = req.body.transaction_id;

    subscription_functions.add_subscription_transaction(req,res,sale_or_refund,transaction_id,start_date,end_date).then(function(result) {
        if(result.status) {
            res.status(200).send(result)
        }
        else {
            res.status(404).send(result)
        }
    });
}