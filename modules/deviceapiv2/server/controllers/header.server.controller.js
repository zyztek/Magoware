'use strict';
var path = require('path'),
    response = require(path.resolve("./config/responses.js"));


//RETURNS http headers in json object format

exports.header = function(req, res) {
    var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
    clear_response.response_object = req.headers;
    res.send(clear_response);
};