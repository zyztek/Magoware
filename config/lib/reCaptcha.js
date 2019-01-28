"use strict";

var config = require('../config'),
  request = require('request');
var winston = require("winston");

// Verify the reCaptcha response
exports.verify = function(response, cb) {
  request.post({
    url: "https://www.google.com/recaptcha/api/siteverify",
    form: {
      secret: config.app.reCaptchaSecret,
      response: response
    },
    json: true
  }, function(err, httpResponse, body) {
    if (err) {
      winston.error('reCaptcha error', err);
      cb(err);
    } else if (body.success !== true) {
      cb(body);
    }

    if (cb) cb(null);
  });
};
