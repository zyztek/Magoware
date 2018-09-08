'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    authentication = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller.js')),
    nodemailer = require('nodemailer'),
    async = require('async'),
    crypto = require('crypto'),
    randomstring = require("randomstring"),
    response = require(path.resolve("./config/responses.js")),
    db = require(path.resolve('./config/lib/sequelize')).models,
    login_data = db.login_data,
    email_templates = db.email_templates,
    devices = db.devices;

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function(req, res) {
    login_data.find({
        where: {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }
    }).then(function(user) {
        if (!user) {

            return res.send('<html><body style="background-color:">' +
                '<div style="font-size:20px;position:absolute;padding: 35px;margin-left:23%;margin-bottom: 20px;border: 2px solid transparent; border-radius:6px;color: #8a6d3b;background-color: #fcf8e3;border-color: #faebcc;">' +
                '<center><span>WARNING: </span>Please resent a new request for password change.</center></div></body></html>');

        }

        user.resetPasswordExpires = 0;
        user.save().then(function() {});

        devices.update(
            {
                device_active: false
            },
            {where: {
                    login_data_id:user.id
                }}
        ).then(function() {
            res.send('<html><body style="background-color:">' +
                '<div style="font-size:20px;position:absolute;margin-left:28%;padding: 35px;margin-bottom: 20px;border: 2px solid transparent; border-radius:6px;color: #3c763d;background-color: #dff0d8;border-color: #d6e9c6;">' +
                '<center><span>SUCCESS: </span>Password changed successfully.</center></div></body></html>');

        }).error(function(err) {
            res.send('<html><body style="background-color:">' +
                '<div style="font-size:20px;position:absolute;margin-left:32%;top:35%;left:35%;padding: 35px;margin-bottom: 20px;border: 2px solid transparent; border-radius:6px;color: #a94442;background-color: #f2dede;border-color: #ebccd1;">' +
                '<center><span>ERROR: </span>Error occurred.</center></div></body></html>');
            //handle error here
        });
    });
};

/**
 * @api {post} /apiv2/password/forgot Reset password
 * @apiName ResetPassword
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} [username]  Username account
 * @apiParam {String} [language]  Determines language of the email template
 *
 *@apiDescription Enter a valid username to test the API
 *
 */
exports.forgot = function(req, res, next) {
    var smtpConfig = {
        host: (req.app.locals.settings.smtp_host) ? req.app.locals.settings.smtp_host.split(':')[0] : 'smtp.gmail.com',
        port: (req.app.locals.settings.smtp_host) ? Number(req.app.locals.settings.smtp_host.split(':')[1]) : 465,
        secure: (req.app.locals.settings.smtp_secure === false) ? req.app.locals.settings.smtp_secure : true,
        auth: {
            user: req.app.locals.settings.email_username,
            pass: req.app.locals.settings.email_password
        }
    };

    var smtpTransport = nodemailer.createTransport(smtpConfig);

    async.waterfall([
        //Generate new random password for this user, encrypt it, update password and set all devices for this user as inactive
        function(done) {
            if (req.body.username) {
                // Lookup user data by username
                login_data.find({
                    where: {
                        username: req.body.username.toLowerCase()
                    },
                    include: [{model:db.customer_data, required:true}]
                }).then(function(user) {
                    if (!user) {
                        return res.status(400).send(response.USER_NOT_FOUND);
                    }  else {
                        //generate new password
                        var plaintext_password = randomstring.generate({ length: 4, charset: 'alphanumeric' });
                        var salt = authentication.makesalt();
                        var encrypted_password = authentication.encryptPassword(decodeURIComponent(plaintext_password), salt);
                        //update password for this user
                        login_data.update(
                            {
                                password: encrypted_password,
                                salt: salt
                            },
                            {where: {username: req.body.username}}
                        ).then(function (result) {
                            //log user out of all devices
                            devices.update(
                                {
                                    device_active: false
                                },
                                {where: {username: req.body.username}}
                            ).then(function (result) {
                                done(false, user,plaintext_password);
                                return null;
                            }).catch(function(error) {
                                done(error, user,plaintext_password);
                            });
                            return null;
                        }).catch(function(error) {
                            done(error, user,plaintext_password);
                        });
                        return null;
                    }
                }).catch(function(err) {
                    return res.status(400).send({
                        message: 'Username field must not be blank'
                    });
                });
            } else {
                return res.status(400).send({
                    message: 'Username field must not be blank'
                });
            }
        },
        //Prepare email template with user data and new password
        function(user, new_password, done) {

            email_templates.findOne({
                attributes:['title','content'],
                where: {template_id: 'reset-password-email', language: req.body.language }
            }).then(function (result,err) {
                if(!result){
                    res.render(path.resolve('modules/deviceapiv2/server/templates/reset-password-email'), {
                        name: user.customer_datum.firstname + ' '+ user.customer_datum.lastname, //user info
                        appName: config.app.title,
                        password: new_password //plaintext random password that was generated
                    }, function(err, emailHTML) {
                        done(err, emailHTML, user);
                    });
                } else {
                    var response = result.content;
                    var emailHTML = response.replace(new RegExp('{{name}}', 'gi'), user.customer_datum.firstname + ' ' + user.customer_datum.lastname).replace(new RegExp('{{appName}}', 'gi'),config.app.title).replace(new RegExp('{{password}}', 'gi'),new_password);
                    done(err,emailHTML, user);
                }
            });

        },
        // If valid email, send reset email using service
        function(emailHTML, user, done) {
            var mailOptions = {
                to: user.customer_datum.email, //user.email,
                from: req.app.locals.settings.email_address,
                subject: 'Password Reset',
                html: emailHTML
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if (!err) {
                    response.send_res(req, res, [], 200, 1, 'EMAIL_SENT_DESCRIPTION', 'EMAIL_SENT_DATA', 'no-store');
                } else {
                    response.send_res(req, res, [], 801, -1, 'EMAIL_NOT_SENT_DESCRIPTION', 'EMAIL_NOT_SENT_DATA', 'no-store');
                }
                done(err);
            });
        }
    ], function(err) {
        if (err) {
            return next(err);
        }
    });
};