'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
	crypto = require('crypto'),
	async = require('async'),
	nodemailer = require('nodemailer'),
	response = require(path.resolve("./config/responses.js")),
	authentication = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller.js')),
	subscription = db.subscription,
    Combo = db.combo,
    login_data = db.login_data,
    SalesData = db.salesreport,
    dateFormat = require('dateformat'),
    email_templates = db.email_templates,
    customer_data = db.customer_data;


exports.createaccount = function(req,res) {
	var smtpConfig = {
		host: (req.app.locals.settings.smtp_host) ? req.app.locals.settings.smtp_host.split(':')[0] : 'smtp.gmail.com',
		port: (req.app.locals.settings.smtp_host) ? Number(req.app.locals.settings.smtp_host.split(':')[1]) : 465,
		secure: (req.app.locals.settings.smtp_secure === false) ? req.app.locals.settings.smtp_secure : true,
		auth: {
			user: req.app.locals.settings.email_username,
			pass: req.app.locals.settings.email_password
		},
		tls: {
			rejectUnauthorized: false
		}	
	}

	var smtpTransport = nodemailer.createTransport(smtpConfig);

	async.waterfall([
		// Generate random token
		function(done) {
			crypto.randomBytes(20, function(err, buffer) {
				var token = crypto.randomBytes(Math.ceil(64)).toString('hex').slice(0,128); //generates random string of 128 characters
				done(err, token);
			});
		},
		// check if username exists
		function(token,done) {
			login_data.findOne({
				where: {username: req.body.username.toLowerCase()}
			}).then(function (login_record) {
				if (login_record) {
					response.send_res(req, res, [], 803, -1, 'REGISTRATION_ERROR_DESCRIPTION', 'USERNAME_TAKEN', 'no-store');
					done(null, 1);
					return null;
				}
				else{
					done(null, token);
					return null;
				}
			}).catch(function (err) {
				winston.error("Quering for the client's account data failed with error: ", err);
			});
		},
		// check if email exists
		function(token, done) {
			customer_data.findOne({
				where: {email: req.body.email.toLowerCase()}
			}).then(function (customer_record) {
				if (customer_record) {
					response.send_res(req, res, [], 803, -1, 'REGISTRATION_ERROR_DESCRIPTION', 'EMAIL_ALREADY_EXISTS', 'no-store');
					done(null, 1);
					return null;
				}
				else{
					done(null, token);
					return null;
				}
			}).catch(function (err) {
				winston.error("Quering for the client's personal info failed with error: ", err);
			});
		},
		//create account
		function(token, done) {
			if(token !== 1){
				var salt = authentication.makesalt();

				customer_data.create({
					firstname:	req.body.firstname,
					lastname:	req.body.lastname,
					email:		req.body.email,
					telephone:	req.body.telephone,
					group_id:   1
				}).then(function(new_customer){
					login_data.create({
						customer_id:			  new_customer.id,
						username:				  req.body.username,
						salt:                     salt,
						password:				  req.body.password,
						channel_stream_source_id: 1,
						vod_stream_source:		  1,
						pin:					  1234,
						show_adult:				  0,
						auto_timezone:			  1,
						player:					  (company_configurations.default_player) ? company_configurations.default_player : 'default',
						activity_timeout:		  10800,
						get_messages:			  (company_configurations.get_messages) ? company_configurations.get_messages : false,
						get_ads:			      (company_configurations.get_ads) ? company_configurations.get_ads : false,
						force_upgrade:			  0,
						account_lock:			  0,
						resetPasswordToken:		  token,
						resetPasswordExpires:     Date.now() + 86400000 // email confirmation till 1 day from now
					}).then(function(new_login){
						done(null,token, new_customer);
						return null;
					}).catch(function(err){
						winston.error("Creating a new client account failed with error: ", err);
					});
					return null;
				}).catch(function (err) {
					winston.error("Creating a new customer failed with error: ", err);
				});
			}
			else{
				//todo: return some response?
			}
		},
		//todo: remove this part and it's template?


		function(token, new_customer, done) {

				email_templates.findOne({
                attributes:['title','content'],
                where: {template_id: 'new-account' }
            }).then(function (result,err) {
            	if(!result){
                    res.render(path.resolve('modules/deviceapiv2/server/templates/new-account'), {
                        name: new_customer.firstname + ' ' + new_customer.lastname,
                        appName: req.app.locals.title, //todo: remains from old api???
                        url: req.app.locals.originUrl + '/apiv2/sites/confirm-account/' + token

                    }, function(err, emailHTML) {
                        done(err, emailHTML, new_customer.email);
                    });
				} else {
				 	var response = result.content;
                    var emailHTML = response.replace(new RegExp('{{name}}', 'gi'), new_customer.firstname + ' ' + new_customer.lastname).replace(new RegExp('{{appName}}', 'gi'),req.app.locals.title).replace(new RegExp('{{url}}', 'gi'),req.app.locals.originUrl + '/apiv2/sites/confirm-account/' + token);
                    done(err,emailHTML, new_customer.email);
				}
			});
		},
		function(emailHTML, email, done) {
			var mailOptions = {
				to: email, //user.email,
				from: req.app.locals.settings.email_address, //the from field matches the account username
				subject: 'Account confirmation',
				html: emailHTML
			};

			smtpTransport.sendMail(mailOptions, function(err) {
				var myEmail;
				if (!err) {
					response.send_res(req, res, [], 200, 1, 'EMAIL_SENT_DESCRIPTION', 'CONFIRM_ACCOUNT', 'no-store');

				} else {
					response.send_res(req, res, [], 200, 1, 'EMAIL_NOT_SENT_DESCRIPTION', 'EMAIL_NOT_SENT_DATA', 'no-store');
				}
				done(err);
			});
		}
	],function(err) {
		if (err) {
			return err;
		}
	});
};

exports.confirmNewAccountToken = function(req, res) {
	login_data.find({
		where: {
			resetPasswordToken: req.params.token,
			resetPasswordExpires: {
				$gt: Date.now()
			}
		}
	}).then(function(user) {
		if (!user) {
			return res.send('This link has expired. Unable to confirm account.');
		}
		user.resetPasswordExpires = 0;
		user.account_lock = 0;
		user.save().then(function (result) {
            add_default_subscription(result.id);
		});
	});


    //Adds a default package
	function add_default_subscription(account_id){

        // Loading Combo with All its packages
        Combo.findOne({
            where: {
                product_id: "free_combo"
            }, include: [{model:db.combo_packages,include:[db.package]}]
        }).then(function(combo) {
            if (!combo)
				return res.status(404).send('Account confirmed, you can proceed to login. Contact Magoware support to get your first subscription for free.');
            else {
                // Load Customer by LoginID
                login_data.findOne({
                    where: {
                        id: account_id
                    }, include: [{model:db.customer_data},{model:db.subscription}]
                }).then(function(loginData) {
                    if (!loginData) return res.status(404).send('Account confirmed, you can proceed to login. Unable to add default subscription to your user.');

                    // Subscription Processing
                    // For Each package in Combo
                    combo.combo_packages.forEach(function(item,i,arr){
                        var startDate = Date.now();
                        var sub = {
                            login_id: loginData.id,
                            package_id: item.package_id,
                            customer_username: loginData.username,
                            user_username: 'registration' //live
                        };

                        sub.start_date = Date.now();
                        sub.end_date =  addDays(Date.now(), combo.duration);

                        // Saving Subscription
                        subscription.create(sub).then(function(savedSub) {
                            if (!savedSub) return res.status(400).send('Account confirmed, you can proceed to login. Contact Magoware support to get your first subscription for free.');
                        })
                    });

                    // Insert Into SalesData
                    var sData = {
                        user_id: 1,
                        user_username: loginData.username,
                        login_data_id: loginData.id,
                        distributorname: 'admin',
                        saledate: new Date(),
                        combo_id: combo.id
                    };
                    SalesData.create(sData)
                        .then(function(salesData){
                            if (!salesData) return res.status(400).send('Account confirmed, you can proceed to login. Check with Magoware support to make sure you are subscribed to our free packages');
							else return res.status(400).send('Account confirmed, you can proceed to login.');
                        });
                });
                return null;
            }
        });
	}


    function addDays(startdate_ts, duration) {
        var end_date_ts = startdate_ts + duration * 86400000; //add duration in number of seconds
        var end_date =  dateFormat(end_date_ts, "yyyy-mm-dd HH:MM:ss"); // convert enddate from timestamp to datetime
        return end_date;
    }

};
