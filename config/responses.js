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
    OK: function() {
        this.status_code = 200;
        this.error_code = 1;
        this.timestamp = 1; //Date.now();
        this.error_description = 'OK';
        this.extra_data = '';
        this.response_object = [];
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