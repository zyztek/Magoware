'use strict';
var path = require('path'),
    //sha1 = require('sha1'),
    crypto = require('crypto'),
    responses = require(path.resolve("./config/responses.js")),
    request = require('request');

    /*
    db = require(path.resolve('./config/lib/sequelize')),
    Sequelize = require('sequelize'),
    response = require(path.resolve("./config/responses.js")),
    winston = require(path.resolve('./config/lib/winston')),
    dateFormat = require('dateformat'),
    async = require('async'),
    schedule = require(path.resolve("./modules/deviceapiv2/server/controllers/schedule.server.controller.js")),
    models = db.models;
*/

function mysha1( data ) {
    var generator = crypto.createHash('sha1');
    generator.update( data );
    return generator.digest('hex')
}

exports.flussonic_token__remote =  function(req, res) {

    var stream_name = req.params.stream_name;
    var token_url = req.query.tokenurl;
    var password = 'password';
    var salt = 'somesalt';
    var ip = req.ip.replace('::ffff:', '');
    var starttime = Date.now();
    var endtime = Date.now() + 1000;

    var queryparams = 'sing?' + 'password=' + password+'&name=' + stream_name + '&salt=' + salt + '&ip=' + ip + '&startime=' + starttime + '&endtime=' + endtime;

    request(token_url+queryparams, function (error, response, body) {
        var thisresponse = new responses.OK;

        if(response.statusCode === 200) {
            thisresponse.extra_data = body;
            res.send(thisresponse);
        }
        else {
            res.send(thisresponse);
        }
        //console.log('error:', error); // Print the error if one occurred
        //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //console.log('body:', body); // Print the HTML for the Google homepage.
    });
};

exports.flussonic_token =  function(req, res) {
    var secure_token = "uGhKNDl54sd123"; //server side only
    var password = req.query.password || "tQZ71bHq";
    var salt = req.query.salt || "QKu458HJi";

    var stream_name = req.params.stream_name;
    var ip = req.query.ip || req.ip.replace('::ffff:', '');
    var starttime = req.query.starttime || Date.now()/1000|0;
    var endtime = req.query.endtime || (Date.now()/1000|0) + 3600;

    var tohash = stream_name + ip + starttime + endtime + secure_token + salt;
    //console.log(tohash);

    var token = "?token="+mysha1(tohash)+"-" + salt + "-" + endtime + "-" + starttime;
    responses.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', token, 'no-store');
};