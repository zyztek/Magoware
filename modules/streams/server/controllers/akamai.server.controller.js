'use strict'
var path = require('path'),
    response = require(path.resolve("./config/responses.js"));

var token_generator = require(path.resolve('./modules/streams/server/controllers/akamai_token_v2'));

exports.generate_akamai_token_v2 = function(req,res) {
    var config = {
        algorithm : 'SHA256',
        acl : '/*',
        window : 6000,
        key : "72302fda402dd09c2a91583f", //todo: get key from database
        ip: req.ip.replace('::ffff:', '') || '',
        startTime:0,
        url:'',
        session:'',
        data:'',
        salt:'',
        delimeter:'~',
        escape_early:false,
        name:'__token__'
    };

    var response = {
        "status_code": 200,
        "error_code": -1,
        "error_description": "",
        "extra_data": "",
        "response_object": []
    };

    var token_gen = new token_generator.default(config);

    response.extra_data = "?"+ token_gen.generateToken();

    res.send(response);
};