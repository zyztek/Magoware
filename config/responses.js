"use strict";
var crypto = require('crypto');
/**
 * Configuration file where you can store error codes for responses
 *
 * It's just a storage where you can define your custom API errors and their description.
 */

module.exports = {

    APPLICATION_RESPONSE: function(language, status_code, error_code, error_description, extra_data, data) {
        this.status_code = status_code;
        this.error_code = error_code;
        this.timestamp = 1; //Date.now();
        this.error_description = (languages[language]) ? languages[language].language_variables[error_description] : languages['eng'].language_variables[error_description];
        this.extra_data = (languages[language]) ? languages[language].language_variables[extra_data] : extra_data;
        this.response_object = data;
    },
    CREATED: function(language, error_description, extra_data){
        this.code = 'CREATED';
        this.message = 'The request has been fulfilled and resulted in a new resource being created';
        this.status = 201
    },

    FORBIDDEN: function(language, error_description, extra_data){
        this.code = 'E_FORBIDDEN';
        this.message = 'User not authorized to perform the operation';
        this.status = 403
    },

    NOT_FOUND: function(language, error_description, extra_data){
        this.code = 'E_NOT_FOUND';
        this.message = 'The requested resource could not be found but may be available again in the future';
        this.status = 404
    },


    SERVER_ERROR: function(language, error_description, extra_data){
        this.code = 'E_INTERNAL_SERVER_ERROR';
        this.message = 'Something bad happened on the server';
        this.status = 500
    },

    UNAUTHORIZED: function(language, error_description, extra_data){
        this.code = 'E_UNAUTHORIZED';
        this.message = 'Missing or invalid authentication token';
        this.status = 401
    },
    OK: function() {
        this.status_code = 200;
        this.error_code = 1;
        this.timestamp = 1; //Date.now();
        this.error_description = 'OK';
        this.extra_data = '';
        this.response_object = [{}];
    },
    BAD_REQUEST: {
        "status_code": 701,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'E_BAD_REQUEST',
        "extra_data": 'The request cannot be fulfilled due to bad syntax',
        "response_object": [{}]
    },
    USER_NOT_FOUND: {
        "status_code": 702,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'USER_NOT_FOUND',
        "extra_data": 'User not found',
        "response_object": [{}]
    },
    ACCOUNT_LOCK: {
        "status_code": 703,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'ACCOUNT_LOCK',
        "extra_data": 'User account locked',
        "response_object": [{}]
    },
    WRONG_PASSWORD: {
        "status_code": 704,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'WRONG_PASSWORD',
        "extra_data": 'Password does not match',
        "response_object": [{}]
    },
    DUAL_LOGIN_ATTEMPT: {
        "status_code": 705,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'DUAL_LOGIN_ATTEMPT',
        "extra_data": 'Attempt to login on another device',
        "response_object": [{}]
    },
    DATABASE_ERROR: function() {
        this.status_code = 706;
        this.error_code = -1;
        this.timestamp = Date.now();
        this.error_description = 'DATABASE_ERROR';
        this.extra_data = 'Error connecting to database';
        this.response_object = [{}];
    },
    UPDATE_FAILED: function(language, status_code, error_code, error_description, extra_data) {
        this.status_code = status_code;
        this.error_code = error_code;
        this.timestamp = Date.now();
        this.error_description = (languages[language]) ? languages[language].language_variables[error_description] : languages['eng'].language_variables[error_description];
        this.extra_data = (languages[language]) ? languages[language].language_variables[extra_data] : languages['eng'].language_variables[extra_data];
        this.response_object = [];
    },
    EMAIL_SENT: {
        "status_code": 200,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'EMAIL SENT',
        "extra_data": 'Email successfuly sent',
        "response_object": [{}]
    },
    EMAIL_NOT_SENT: {
        "status_code": 801,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'EMAIL ERROR',
        "extra_data": 'Error sending email',
        "response_object": [{}]
    },
    REGISTRATION_ERROR: {
        "status_code": 803,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'REGISTRATION_FAILED',
        "extra_data": '',
        "response_object": [{}]
    },
    BAD_TOKEN: {
        "status_code": 888,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'BAD TOKEN',
        "extra_data": 'Token cannot be decrypted',
        "response_object": [{}]
    },

    send_res: function(req, res, result, status, error, description, extra_data, header){
        var evaluation_tag = crypto.createHash('sha256').update(JSON.stringify(result)).digest('hex');
        var client_etag = (!req.header('clientsETag')) ? "" : req.header('clientsETag');
        var status_code = (evaluation_tag!==client_etag || req.path === '/apiv2/settings/settings') ? status : 304; // if the response data is different from the one in the app cache, send status different that 304
        var response_data = (evaluation_tag!==client_etag || req.path === '/apiv2/settings/settings') ? result : []; // only new responses will be sent
        var cache_header = (status_code===200) ? header : 'no-store'; //only responses that contain new data will be stored

        res.setHeader('etag', evaluation_tag);
        res.setHeader('cache-control', cache_header);
        var clear_response = new this.APPLICATION_RESPONSE(req.body.language, status_code, error, description, extra_data, response_data);
        res.send(clear_response);
    },

    send_res_get: function(req, res, result, status, error, description, extra_data, header){
        var clear_response = new this.APPLICATION_RESPONSE(req.body.language, status, error, description, extra_data, result);
        res.send(clear_response);
    },


    send_partial_res: function(req, res, result, status, error, description, extra_data, header){
        var evaluation_tag = crypto.createHash('sha256').update(JSON.stringify(result)).digest('hex'); //calculate etag for this response
        var client_etag = (!req.header('clientsETag')) ? "" : req.header('clientsETag'); //set value of incoming etag

        if(!vod_list[""+req.auth_obj.boxid+""]) vod_list[""+req.auth_obj.boxid+""] = []; //if no etags are stored for this user, create object with boxid as object name
        var cached_etag = (vod_list[""+req.auth_obj.boxid+""][req.body.subset_number]) ? vod_list[""+req.auth_obj.boxid+""][req.body.subset_number] : ""; //todo: lexoje nga memoria

        var status_code = (client_etag === "" || client_etag === 0 || client_etag === '0' || (evaluation_tag !== cached_etag)) ? status : 304; //if the response data is different from the one in the server cache or app cache is empty, send status different that 304
        var response_data = (client_etag === "" || client_etag === 0 || client_etag === '0' || (evaluation_tag !== cached_etag)) ? result : []; // only new responses will be sent
        var cache_header = (status_code===200) ? header : 'no-store'; //todo: recheck login here //only responses that contain new data will be stored


        vod_list[""+req.auth_obj.boxid+""][req.body.subset_number] = evaluation_tag;

        res.setHeader('etag', evaluation_tag);
        res.setHeader('cache-control', cache_header);
        var clear_response = new this.APPLICATION_RESPONSE(req.body.language, status_code, error, description, extra_data, response_data);
        res.send(clear_response);
    }

};