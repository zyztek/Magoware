'use strict'
var path = require('path'),
    response = require(path.resolve("./config/responses.js")),
    akamai_token_generator = require(path.resolve('./modules/streams/server/controllers/akamai_token_v2')),
    crypto = require('crypto'),
    responses = require(path.resolve("./config/responses.js"));


function getClientIp(req) {
    var ipAddress;
    // The request may be forwarded from local web server.
    var forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
        // 'x-forwarded-for' header may return multiple IP addresses in
        // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
        // the first one
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        // If request was not forwarded
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
}

function mysha1( data ) {
    var generator = crypto.createHash('sha1');
    generator.update( data );
    return generator.digest('hex')
}

exports.akamai_token_v2_generator = function(req,res) {
    var config = {
        algorithm : 'SHA256',
        acl : '*',
        window : req.app.locals.streamtokens.AKAMAI.WINDOW,
        key : req.app.locals.streamtokens.AKAMAI.TOKEN_KEY,
        //ip: getClientIp(req),
        ip: req.ip.replace('::ffff:', ''),
        startTime:0,
        url:'',
        session:'',
        data:'bbbbb',
        salt: req.app.locals.streamtokens.AKAMAI.SALT,
        delimeter:'~',
        escape_early:false,
        name:'__token__'
    };

    var token = "?" + new akamai_token_generator.default(config).generateToken();
    var theresponse = new responses.OK();
    theresponse.extra_data = token;
    res.send(theresponse);
};

exports.catchup_akamai_token_v2_generator = function(req,res) {
    var config = {
        algorithm : 'SHA256',
        acl : '*',
        window : req.app.locals.streamtokens.AKAMAI.WINDOW,
        key : req.app.locals.streamtokens.AKAMAI.TOKEN_KEY,
        //ip: getClientIp(req),
        ip: req.ip.replace('::ffff:', ''),
        startTime:0,
        url:'',
        session:'',
        data:'bbbbb',
        salt: req.app.locals.streamtokens.AKAMAI.SALT,
        delimeter:'~',
        escape_early:false,
        name:'token'
    };

    var token = "?" + new akamai_token_generator.default(config).generateToken();
    var theresponse = new responses.OK();
    theresponse.extra_data = token;
    res.send(theresponse);
};



exports.akamai_token_v2_generator_tibo_mobile = function(req,res) {
    var config = {
        algorithm : 'SHA256',
        acl : '*',
        window : req.app.locals.streamtokens.AKAMAI.WINDOW,
        key : "BB4D383893D0EE64",
        //ip: getClientIp(req),
        ip: req.ip.replace('::ffff:', ''),
        startTime:0,
        url:'',
        session:'',
        data:'',
        salt: req.app.locals.streamtokens.AKAMAI.SALT,
        delimeter:'~',
        escape_early:false,
        name:'__token__'
    };

    var token = "?" + new akamai_token_generator.default(config).generateToken();
    var theresponse = new responses.OK();
    theresponse.extra_data = token;
    res.send(theresponse);
};


exports.flussonic_token_generator =  function(req, res) {
    var token_key = req.app.locals.streamtokens.FLUSSONIC.TOKEN_KEY; //server side only
    var password = req.query.password || req.app.locals.streamtokens.FLUSSONIC.PASSWORD; //Can be sent as query parameter
    var salt = req.query.salt || req.app.locals.streamtokens.FLUSSONIC.SALT; //Can be sent as query parameter

    var stream_name = req.params[0];
    var ip = req.query.ip || req.ip.replace('::ffff:', '');
    var starttime = req.query.starttime || Date.now()/1000|0;
    var endtime = req.query.endtime || (Date.now()/1000|0) + req.app.locals.streamtokens.FLUSSONIC.WINDOW;;

    var tohash = stream_name + ip + starttime + endtime + token_key + salt;

    var token = "?token="+mysha1(tohash)+ "-" + salt + "-" + endtime + "-" + starttime;

    var theresponse = new responses.OK();
    theresponse.extra_data = token;

    res.send(theresponse);
};

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
        var thisresponse = new responses.OK();

        if(response.statusCode === 200) {
            thisresponse.extra_data = body;
            res.send(thisresponse);
        }
        else {
            res.send(thisresponse);
        }
    });
};