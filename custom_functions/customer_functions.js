'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    authenticationHandler = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller')),

    db = require(path.resolve('./config/lib/sequelize')).models,
    db_t = require(path.resolve('./config/lib/sequelize')),
    DBModel = db.login_data;


exports.create_customer_data = function(req,res) {
    req.body.group_id = 1;
    return db.login_data.upsert(
        req.body
    ).then(function(result) {
        console.log('success:',result);
        return true;
    }).catch(function (err) {
        console.log(err.message);
        return {status: false, message: "there was an error running query"}
    });
};


exports.create_login_data = function(req, res, login_data_username) {

    var newData = req.body;
    newData.salt = authenticationHandler.makesalt();
    if(!login_data_username) return {status: false, message: "username cannot be blank"};
    newData.username = login_data_username;
    if(!newData.customer_id) newData.customer_id = 1;
    if(!newData.password) newData.password = login_data_username;
    if(!newData.channel_stream_source_id) newData.channel_stream_source_id = 1;
    if(!newData.vod_stream_source) newData.vod_stream_source = 1;
    if(!newData.customer_id) newData.customer_id = 1;
    if(!newData.pin) newData.pin = 1234;

    newData['updatedate'] = new Date();

    return DBModel.findOne({
        where: {username: login_data_username.toLowerCase()}
    }).then(function (login_record) {
        if (login_record) {
            return {status: true, message: "user found"}
        }
        else{
            return DBModel.create(newData).then(function(result) {
                if (!result) {
                    return {status: false, message: "there was an error creating username"}

                } else {
                    return {status: true, message: "user created successfuly"}
                }
            }).catch(function(err) {
                return {status: false, message: "there was an error creating username"}
            });

        }
    }).catch(function (err) {
        return {status: false, message: "there was an error running query"}
    });
};



exports.create_customer_with_login = function(req, res) {

    return db.customer_data.findOne({
        where: {email: req.body.email.toLowerCase()}
    }).then(function (customer_response) {
        if (customer_response) {
            return {status: false, message: "Email address already exists"}; //return if emial address found
        }
        else{
            //search if username exists
            return db.login_data.findOne({
                where: {username: req.body.username.toLowerCase()}
            }).then(function (login_data) {
                if (login_data) {
                    return {status: false, message: "Username address already exists"} //return is username found
                }
                else {
                    //begin data customer creation transaction
                    return db_t.sequelize.transaction(function (t) {
                        req.body.group_id = (req.body.group_id)?req.body.group_id:1;

                        return db.customer_data.create(
                            req.body,{transaction: t}
                        ).then(function (new_customer) {
                            req.body.customer_id = new_customer.id;
                            req.body.salt = authenticationHandler.makesalt();
                            req.body.password = (req.body.password)?req.body.password:"1234";
                            req.body.channel_stream_source_id = (req.body.channel_stream_source_id)?req.body.channel_stream_source_id:1;
                            req.body.vod_stream_source = (req.body.vod_stream_source)?req.body.vod_stream_source:1;
                            req.body.pin = (req.body.pin)?req.body.pin:1234;
                            return db.login_data.create(req.body, {transaction: t});
                        });

                    }).then(function (result) {
                        // Transaction has been committed
                        return {status: true, message: "Customer created successfuly"};
                    }).catch(function (err) {
                        // Transaction has been rolled back
                        return {status: false, message: "Error creating customer - "+err.message};
                    });
                }
            })
            //return {status: true, message: "fine  address already exists"}; //return if emial address found
        }
    }).catch(function (err) {
        console.log(err);
        return {status: false, message: "there was an error running the query "+err.message}
    });
};