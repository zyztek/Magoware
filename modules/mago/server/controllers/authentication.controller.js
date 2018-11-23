'use strict';

var jwt = require('jsonwebtoken'),
    jwtSecret = "thisIsMySecretPasscode",
    jwtIssuer = "MAGOWARE";

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    async = require('async'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    config = require(path.resolve('./config/config')),
    DBModel = db.users;

/**
 * @api {post} /api/auth/login /api/auth/login
 * @apiVersion 0.2.0
 * @apiName System User Login
 * @apiGroup Backoffice
 * @apiParam {String} username  Mandatory username field.
 * @apiParam {String} password  Mandatory password field.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "the.token.string"
 *     }
 * @apiError (40x) {String} message wrong username or password
 */

exports.authenticate = function(req, res) {
    var authBody = req.body;
    DBModel.findOne(
        {
            where: {
                username: authBody.username
            },
            include: [{model:db.groups, required: true}]
        }
    ).then(function(result){
        if (!result) {
            return res.status(404).send({
                message: 'UserName or Password does not match'
            });
        } else {

            if(!result.authenticate(authBody.password)) {
                return res.status(401).send({
                    message: 'UserName or Password does not match'
                });

            }
            var group = {};
            if(result.group){
                group = result.group.code;
            }else{
                group = "guest"; // Defaulting to GUEST group
            }

            var token = jwt.sign(
                {
                    id: result.id,
                    iss: jwtIssuer,
                    sub: result.username,
                    username: result.username,
                    uid: result.id,
                    role: group
                }, jwtSecret,{
                    expiresIn: "4h"
                });
            res.json({token:token});
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

exports.get_personal_details = function(req, res) {
    DBModel.findOne(
        {
            where: {
                username: req.token.sub
            }
        }
    ).then(function(result){
        res.send(result);
    }).catch(function(err) {
        return res.status(404).send({
            message: 'User not found'
        });
    });
};

/**
 * Update
 */
exports.update_personal_details = function(req, res) {

    DBModel.findOne({
        where: {username: req.token.sub}
    }).then(function(result) {

        if(result) {
            result.updateAttributes(req.body)
                .then(function(result) {
                    res.json(result);
                })
                .catch(function(err) {
                    return res.status(500).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                });
        }
        else {
            return res.status(404).send({
                message: 'User not found'
            });
        }
    });
};

/**
 * Change Password
 */
exports.changepassword1 = function(req, res, next) {
    // Init Variables
    var passwordDetails = req.body;
    var message = null;

    if (req.token) {
        if (passwordDetails.newPassword) {
            DBModel.findById(req.token.uid).then(function(user) {
                if (user) {
                    if (user.authenticate(passwordDetails.currentPassword)) {
                        if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                            user.hashedpassword = user.encryptPassword(passwordDetails.newPassword,user.salt);
                            user.save()
                                .then(function() {
                                    res.send({
                                        message: 'Password changed successfully'
                                    });
                                })
                                .catch(function(error) {
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(error)
                                    });
                                });
                        } else {
                            res.status(400).send({
                                message: 'Passwords do not match'
                            });
                        }
                    } else {
                        res.status(400).send({
                            message: 'Current password is incorrect'
                        });
                    }
                } else {
                    res.status(400).send({
                        message: 'User is not found'
                    });
                }
            });
        } else {
            res.status(400).send({
                message: 'Please provide a new password'
            });
        }
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};


/**
 * Forgot for reset password (forgot POST)
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
        // Generate random token
        function(done) {
            crypto.randomBytes(20, function(err, buffer) {
                var token = Buffer.from('tokensample').toString('hex');
                done(err, token);
            });
        },
        // Lookup user by username
        function(token, done) {
            if (req.body.username) {

                DBModel.find({
                    where: {
                        username: req.body.username.toLowerCase()
                    }
                }).then(function(user) {
                    if (!user) {
                        return res.status(400).send({
                            message: 'No account with that username has been found'
                        });
                    } else {
                        user.resetpasswordtoken = token;
                        user.resetpasswordexpires = Date.now() + 3600000; // 1 hour
                        user.save().then(function(saved) {
                            var err = (!saved) ? true : false;
                            done(err, token, saved);
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
        function(token, user, done) {
            res.render(path.resolve('modules/mago/server/templates/reset-password-email'), {
                name: user.displayName,
                appName: config.app.title,
                url: 'http://' + req.headers.host + '/api/auth/tokenvalidate/' + token
            }, function(err, emailHTML) {
                done(err, emailHTML, user);
            });
        },
        // If valid email, send reset email using service
        function(emailHTML, user, done) {
            var mailOptions = {
                to: user.email,
                from: req.app.locals.settings.email_address,
                subject: 'Password Reset',
                html: emailHTML
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if (!err) {
                    res.send({
                        message: 'An email has been sent to the provided email with further instructions.'
                    });
                } else {
                    return res.status(400).send({
                        message: 'Failure sending email'
                    });
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

exports.renderPasswordForm = function(req,res) {
    res.render(path.resolve('modules/mago/server/templates/reset-password-enter-password'), {token:req.params.token}, function(err, html) {
        res.send(html);
    });

}

exports.resetPassword = function(req,res) {

    res.redirect('/admin');

}