'use strict';
var path = require('path'),
    response = require(path.resolve("./config/responses.js"));


//RETURNS http headers in json object format

exports.header = function(req, res) {
    response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
};