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
    //encryptedText = encryptedText.replace(/(\r\n|\n|\r)/gm, "");
    encryptedText = encryptedText.replace(/\\n|\\r|\n|\r/g, "");

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

function auth_decrypt1(token_string, key) {
    var C = CryptoJS;
    token_string = token_string.replace(/(,\+)/g, ',').replace(/\\r|\\n|\n|\r/g, ''); //remove all occurrences of '+' characters before each token component, remove newlines and carriage returns
    var token_object = querystring.parse(token_string,",","="); //convert token string into token object. library
    var test = token_object.auth.replace(/ /g, "+"); //handle library bug that replaces all '+' characters with spaces

    test = C.enc.Base64.parse(test);
    key = C.enc.Utf8.parse(key);
    var aes = C.algo.AES.createDecryptor(key, {
        mode: C.mode.CBC,
        padding: C.pad.Pkcs7,
        iv: key
    });
    var decrypted = aes.finalize(test);
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

    return hash == winston.info(key.toString('base64'));
}

exports.plainAuth = function(req, res, next) {
    req.plaintext_allowed = true;
    next();
}

exports.emptyCredentials = function(req, res, next) {
    req.empty_cred = true;
    next();
}


/**
 * @apiDefine header_auth
 * @apiHeader {String[]} auth Encoded client authentification token. Sample structure, after decoding:
 *
 * {api_version=22, appversion=1.1.4.2, screensize=480x800, appid=2, devicebrand=+SM-G361F+Build/LMY48B, language=eng, ntype=1, app_name=MAGOWARE, device_timezone=2, os=Linux U Android+5.1.1, auth=8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG/FoT9fEw4CrxF, hdmi=false, firmwareversion=LMY48B.G361FXXU1APB1}
 *
 */

/**
 * @apiDefine body_auth
 * @apiParam {String[]} auth Encrypted client authentification token. Sample structure, after decrypting:
 *
 *  username=chernoalpha;password=klmn;boxid=63a7240ers2a745f;appid=2;timestamp=1529422891012
 *
 */

exports.isAllowed = function(req, res, next) {



    if(req.body.auth){  //serach for auth
        var auth = decodeURIComponent(req.body.auth);
    }
    else if(req.headers.auth){ //
        var auth = decodeURIComponent(req.headers.auth);
    }
    else {
        var auth = decodeURIComponent(req.params.auth);
    }

    //

    if(req.headers.auth){

        auth = auth.replace("{","");
        auth = auth.replace("}","");

        if(missing_params(querystring.parse(auth_decrypt1(auth,req.app.locals.settings.new_encryption_key),";","=")) === false){
            var auth_obj = querystring.parse(auth_decrypt1(auth,req.app.locals.settings.new_encryption_key),";","=");
        }
        else if(missing_params(querystring.parse(auth_decrypt1(auth,req.app.locals.settings.old_encryption_key),";","=")) === false && req.app.locals.settings.key_transition === true){
            var auth_obj = querystring.parse(auth_decrypt1(auth,req.app.locals.settings.old_encryption_key),";","=");
        }
        else {
            response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_TOKEN', 'no-store');
        }
    }
    else{
        if(isplaintext(auth, req.plaintext_allowed)){
            if(req.plaintext_allowed){
                var auth_obj = parse_plain_auth(auth); //nese lejohet plaintext, ndaje dhe parsoje
            }
            else{
                response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'PLAINTEXT_TOKEN', 'no-store');
            }
        }
        else{
            if(missing_params(querystring.parse(auth_decrypt(auth,req.app.locals.settings.new_encryption_key),";","=")) === false){
                var auth_obj = querystring.parse(auth_decrypt(auth,req.app.locals.settings.new_encryption_key),";","=");
            }
            else if(missing_params(querystring.parse(auth_decrypt(auth,req.app.locals.settings.old_encryption_key),";","=")) === false && req.app.locals.settings.key_transition === true){
                var auth_obj = querystring.parse(auth_decrypt(auth,req.app.locals.settings.old_encryption_key),";","=");
            }
            else {
                response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_TOKEN', 'no-store');
            }
        }
    }



    if(auth_obj){
        if((req.body.hdmi === 'true') && (['2', '3'].indexOf(auth_obj.appid) !== -1)){
            response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_INSTALLATION', 'no-store'); //hdmi cannot be active for mobile devices
        }
        else if(valid_timestamp(auth_obj) === false){
            response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_TIMESTAMP', 'no-store');
        }
        else if(valid_appid(auth_obj) === true){
            set_screensize(auth_obj);

            if(req.empty_cred){
                req.auth_obj = auth_obj;
                next();
            }
            else{
                //reading client data
                models.login_data.findOne({
                    where: {username: auth_obj.username}
                }).then(function (result) {
                    if(result) {
                        //the user is a normal client account. check user rights to make requests with his credentials
                        if(auth_obj.username !== 'guest'){
                            if(result.account_lock) {
                                response.send_res(req, res, [], 703, -1, 'ACCOUNT_LOCK_DESCRIPTION', 'ACCOUNT_LOCK_DATA', 'no-store');
                            }
                            else if(authenticationHandler.authenticate(auth_obj.password, result.salt, result.password) === false) {
                                response.send_res(req, res, [], 704, -1, 'WRONG_PASSWORD_DESCRIPTION', 'WRONG_PASSWORD_DATA', 'no-store');
                            }
                            else if( (result.resetPasswordExpires !== null ) && (result.resetPasswordExpires.length > 9 && result.resetPasswordExpires !== '0') ){
                                response.send_res(req, res, [], 704, -1, 'EMAIL_NOT_CONFIRMED', 'EMAIL_NOT_CONFIRMED_DESC', 'no-store');
                            }
                            else {
                                req.thisuser = result;
                                req.auth_obj = auth_obj;
                                next();
                                return null; //returns promise
                            }
                        }
                        //login as guest is enabled and the user is guest. allow request to be processed
                        else if( (auth_obj.username === 'guest') && (req.app.locals.backendsettings.allow_guest_login === true) ){
                            req.thisuser = result;
                            req.auth_obj = auth_obj;
                            next();
                            return null; //returns promise
                        }
                        //the user is a guest account but guest login is disabled. return error message
                        else response.send_res(req, res, [], 702, -1, 'GUEST_LOGIN_DISABLED_DESCRIPTION', 'GUEST_LOGIN_DISABLED_DATA', 'no-store');
                    }
                    else response.send_res(req, res, [], 702, -1, 'USER_NOT_FOUND_DESCRIPTION', 'USER_NOT_FOUND_DATA', 'no-store');
                }).catch(function(error) {
                    response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                });
            }
        }
        else {
            response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_APPID', 'no-store');
        }

    }
};

function missing_params(auth_obj){
    if(auth_obj.username == undefined || auth_obj.password == undefined || auth_obj.appid == undefined || auth_obj.boxid == undefined || auth_obj.timestamp == undefined) return true;
    else return false;
}
function valid_timestamp(auth_obj){
    if((Math.abs(Date.now() - auth_obj.timestamp)) > 120000) return true;
    else return true;
}
function valid_appid(auth_obj){
    if(['1', '2', '3', '4', '5', '6'].indexOf(auth_obj.appid) === -1) return false;
    else return true;
}
function set_screensize(auth_obj){
    if(['1', '4', '5', '6'].indexOf(auth_obj.appid) === -1) auth_obj.screensize = 2;
    else auth_obj.screensize = 1;
}
function isplaintext(auth, plaintext_allowed){
    var auth_obj = parse_plain_auth(auth);
    if(auth_obj.username && auth_obj.password && auth_obj.appid && auth_obj.boxid && auth_obj.timestamp){
        return true;
    }
    else if(auth_obj.hasOwnProperty('username') && auth_obj.hasOwnProperty('password') && auth_obj.appid && auth_obj.boxid && auth_obj.timestamp && plaintext_allowed){
        return true;
    }
    else{
        return false;
    }
}

function parse_plain_auth(auth){
    var final_auth = {};
    var auth_array = auth.split(";");
    for(var i=0; i<auth_array.length; i++){
        var key = auth_array[i].split("=")[0];
        var value = auth_array[i].split("=")[1];
        final_auth[key] = value;
    }
    return final_auth;
}