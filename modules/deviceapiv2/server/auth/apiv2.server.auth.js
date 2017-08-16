'use strict';

var CryptoJS = require("crypto-js"),
    crypto = require("crypto"),
    querystring = require("querystring"),
    path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    models = db.models,
    authenticationHandler = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller.js')),
    response = require(path.resolve("./config/responses.js"));

function auth_encrytp(plainText, key) {
    var C = CryptoJS;
    plainText = C.enc.Utf8.parse(plainText);
    key = C.enc.Utf8.parse(key);
    var aes = C.algo.AES.createEncryptor(key, {
        mode: C.mode.CBC,
        padding: C.pad.Pkcs7,
        iv: key
    });
    var encrypted = aes.finalize(plainText);
    return C.enc.Base64.stringify(encrypted);
}

function auth_decrypt(encryptedText, key) {
    var C = CryptoJS;
    encryptedText = encryptedText.replace(/(\r\n|\n|\r)/gm, "");
    encryptedText = C.enc.Base64.parse(encryptedText);
    key = C.enc.Utf8.parse(key);
    var aes = C.algo.AES.createDecryptor(key, {
        mode: C.mode.CBC,
        padding: C.pad.Pkcs7,
        iv: key
    });
    var decrypted = aes.finalize(encryptedText);

    try {
        return C.enc.Utf8.stringify(decrypted);
    }
    catch(err) {
        return "error";
    }
}

function auth_veryfyhash(password,salt,hash) {
    var b = new Buffer(salt, 'base64');
    var iterations = 1000;
    var clength = 24;

    const key = crypto.pbkdf2Sync(password, b, iterations, clength, 'sha1');

    return hash == console.log(key.toString('base64'));
}

exports.plainAuth = function(req, res, next) {
    req.plaintext_allowed = true;
    next();
}

exports.emptyCredentials = function(req, res, next) {
    console.log("mund te logohet me cred bosh")
    req.empty_cred = true;
    next();
}

exports.isAllowed = function(req, res, next) {
    //lexo auth
    if(req.body.auth){
        console.log("e marrim auth nga body")
        var auth = decodeURIComponent(req.body.auth);
    }
    else{
        console.log("e marrim auth nga url")
        var auth = decodeURIComponent(req.params.auth);
    }
    //krijo objektin e auth

    if(isplaintext(auth)){
        if(req.plaintext_allowed){
            console.log("lejohet dhe eshte plaintext")
            var auth_obj = querystring.parse(auth,";","="); //nese lejohet plaintext, ndaje dhe parsoje
        }
        else{
            var invalid_token = new response.APPLICATION_RESPONSE(req.body.language, 888, -1, 'BAD_TOKEN_DESCRIPTION', 'PLAINTEXT_TOKEN');
            return res.send(invalid_token);
        }
    }
    else{
        if(missing_params(querystring.parse(auth_decrypt(auth,req.app.locals.settings.new_encryption_key),";","=")) === false){
            var auth_obj = querystring.parse(auth_decrypt(auth,req.app.locals.settings.new_encryption_key),";","=");
        }
        else if(missing_params(querystring.parse(auth_decrypt(auth,req.app.locals.settings.old_encryption_key),";","=")) === false && req.app.locals.settings.key_transition === true){
            console.log("------------- te old key");
            var auth_obj = querystring.parse(auth_decrypt(auth,req.app.locals.settings.old_encryption_key),";","=");
        }
        else {
            console.log("------------- tentativat per dekriptim deshtuan");
            console.log(querystring.parse(auth_decrypt(auth,req.app.locals.settings.new_encryption_key),";","="));
            console.log(querystring.parse(auth_decrypt(auth,req.app.locals.settings.old_encryption_key),";","="));
            console.log(auth_obj);
            var invalid_token = new response.APPLICATION_RESPONSE(req.body.language, 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_TOKEN');
            return res.send(invalid_token);
        }
    }

    if(auth_obj){
        if((req.body.hdmi === 'true') && (['2', '3'].indexOf(auth_obj.appid) !== -1)){
            console.log("hdmi appid mismatch");
            console.log(req.body.hdmi === 'true');
            console.log(['2', '3'].indexOf(auth_obj.appid) !== -1);
            var invalid_token = new response.APPLICATION_RESPONSE(req.body.language, 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_INSTALLATION');
            return res.send(invalid_token);
        }
        else {
            console.log("hdmi appid match")
            console.log(req.body.hdmi === 'true')
            console.log(['2', '3'].indexOf(auth_obj.appid) !== -1)
        }
        if(valid_timestamp(auth_obj) === false){
            console.log("timestamp ok")
            var invalid_token = new response.APPLICATION_RESPONSE(req.body.language, 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_TIMESTAMP');
            return res.send(invalid_token);
        }
        else {
            console.log("timestamp eshte ne rregull")
        }

        if(valid_appid(auth_obj) === true){
            console.log("appid e vlefshme")
            set_screensize(auth_obj);
        }
        else {
            console.log("appid jo e vlefshme")
            var invalid_token = new response.APPLICATION_RESPONSE(req.body.language, 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_APPID');
            return res.send(invalid_token);
        }

        if(req.empty_cred){
            req.auth_obj = auth_obj;
            next();
        }
        else{
            //do lexojme te dhenat e user. kjo do behet sinkrone me te tjerat
            models.login_data.findOne({
                where: {username: auth_obj.username}
            }).then(function (result) {
                console.log("te leximi i login")
                console.log(auth_obj)
                if(result) {
                    console.log("ka result")
                    if(result.account_lock) {
                        var invalid_token = new response.APPLICATION_RESPONSE(req.body.language, 888, -1, 'BAD_TOKEN_DESCRIPTION', 'LOCKED_ACCOUNT');
                        return res.send(invalid_token);
                    }
                    else if(authenticationHandler.authenticate(auth_obj.password, result.salt, result.password) === false) {
                        var invalid_token = new response.APPLICATION_RESPONSE(req.body.language, 888, -1, 'BAD_TOKEN_DESCRIPTION', 'PASSWORD_MISMATCH');
                        return res.send(invalid_token);
                    }
                    else {
                        console.log("all ok")
                        req.thisuser = result;
                        req.auth_obj = auth_obj;
                        next();
                    }
                }
                else{
                    console.log("nuk ka result")
                    var invalid_token = new response.APPLICATION_RESPONSE(req.body.language, 888, -1, 'BAD_TOKEN_DESCRIPTION', 'USER_NOT_FOUND_DATA');
                    return res.send(invalid_token);
                }
            }).catch(function(error) {
                var invalid_token = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
                return res.send(invalid_token);
            });
        }
    }
};

function missing_params(auth_obj){
    if(auth_obj.username == undefined || auth_obj.password == undefined || auth_obj.appid == undefined || auth_obj.boxid == undefined || auth_obj.timestamp == undefined) return true;
    else return false;
}
function valid_timestamp(auth_obj){
    if((Math.abs(Date.now() - auth_obj.timestamp)) > 120000) return false;
    else return true;
}
function valid_appid(auth_obj){
    if(['1', '2', '3', '4', '5'].indexOf(auth_obj.appid) === -1) return false;
    else return true;
}
function set_screensize(auth_obj){
    if(['1', '4', '5'].indexOf(auth_obj.appid) === -1) auth_obj.screensize = 2;
    else auth_obj.screensize = 1;
    console.log("screensize "+auth_obj.screensize)
}
function isplaintext(auth){
    var auth_obj = querystring.parse(auth,";","=");
    if(auth_obj.username && auth_obj.password && auth_obj.appid && auth_obj.boxid && auth_obj.timestamp){
        console.log("auth is plain")
        console.log(auth_obj);
        return true;
    }
    else{
        console.log("auth !!!!!!! plain")
        console.log(auth_obj);
        return false;
    }
}
