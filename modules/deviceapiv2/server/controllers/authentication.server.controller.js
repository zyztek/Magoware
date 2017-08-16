'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    response = require(path.resolve("./config/responses.js")),
    winston = require(path.resolve('./config/lib/winston')),
    crypto = require('crypto'),
    CryptoJS  = require('crypto-js'),
    querystring = require("querystring"),
    models = db.models;

//returns a random salt
function makesalt(){
    return crypto.randomBytes(16).toString('base64');
}

//returns encrypted value of the plaintext password, with the given salt
function encryptPassword(password, salt) {
     if (!password || !salt)
     return '';
     salt = new Buffer(salt, 'base64');
     return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64'); //at least 640000 times is suggested, will see later
}

//compares db password with the password that the client sends, by encryting it with the db salt
function authenticate(plainTextPassword, salt, dbPassword) {
    if(encryptPassword(plainTextPassword, salt) === dbPassword){
        return true;
    }
    else{
        return false;
    }
}

//used by customer_app/changepassword for the ios application
function pass_decrypt(encryptedText, key) {
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
};


module.exports = {
    makesalt: makesalt,
    encryptPassword: encryptPassword,
    authenticate: authenticate,
    decryptPassword: pass_decrypt
}