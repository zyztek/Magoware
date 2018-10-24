'use strict';

var path = require('path'),
  config = require(path.resolve('./config/config')),
  reCaptcha = require(path.resolve('./config/lib/reCaptcha')),
  async = require('async'),
  nodemailer = require('nodemailer');
var request = require('request');

var smtpTransport = nodemailer.createTransport(config.mailer.options);


exports.recaptch_service = function(req, res){

    if(req.body.recaptcha === undefined || req.body.recaptcha === '' || req.body.recaptcha === null ){
        return res.json({"success": false, "msg": "Please select captcha"});
    }
    var secretKey = "6LfJ3Q4UAAAAAPEp1VLwEN-NRvw8KvskWD8sx0KY";
    var verifyUrl = "https://google.com/recaptcha/api/siteverify?secret="+secretKey+"&response="+req.body.recaptcha+"";

    request(verifyUrl, function(error, response, body){
        var thebody = JSON.parse(body);
        if(thebody.success !== undefined && !thebody.success){
            res.send({success: false, message: "Captcha verification failed"});
        }
        else{
            res.send({success: true, message: "Captcha verification succeded"});
        }
    });
}

/**
 * Render the main application page
 */
exports.renderIndex = function(req, res) {
  res.sendFile(__dirname+'public/index.html');
};

/**
 * Render the server error page
 */
exports.renderServerError = function(req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function(req, res) {

  res.status(404).format({
    'text/html': function() {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function() {
      res.json({
        error: 'Path ** not found'
      });
    },
    'default': function() {
      res.send('Path *** not found');
    }
  });
};

exports.contact = function(req, res, next) {

  //Let's do stuff in steps...
  async.waterfall([
    function(done) {
      //Verify the captcha
      reCaptcha.verify(req.body.grecaptcha, function(response) {
        if (!response) {
          done(null);
        } else {
          done("Invalid captcha!");
        }
      });

    },
    function(done) {
      // Prepare the contact form email template
      res.render(path.resolve('modules/core/server/templates/contact-form-email'), {
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
        subject: req.body.subject
      }, function(err, emailHTML) {
        done(err, emailHTML);
      });
    },
    function(emailHTML, done) {
      //Send the email to the admin
      var mailOptions = {
        to: config.mailer.from,
        from: config.mailer.from,
        subject: req.body.name + ' contacted you on contact us form',
        html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function(err) {
        if (err) {
          done('Failed to send the email, please try again later.');
        } else {
          return res.send({
          message: 'Thank you for contacting us! We will get back to you as soon as possible!'
          });
        }
      });
    }
  ], function(err) {
    if (err) {
      return res.status(400).send({
        message: err
      });
    }
  });


};
