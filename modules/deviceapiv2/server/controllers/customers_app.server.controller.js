'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    response = require(path.resolve("./config/responses.js")),
    authentication = require(path.resolve("./modules/deviceapiv2/server/controllers/authentication.server.controller.js")),
    nodemailer = require('nodemailer'),
    models = db.models;


/** @module color/mixer

 * @param {string} color1 - The first color, in hexidecimal format.
 * @param {string} color2 - The second color, in hexidecimal format.
 * @return {string} The blended color.
 */

exports.user_settings = function(req, res) {
    models.login_data.findOne({
        attributes:['id', 'customer_id', 'pin', 'show_adult', 'auto_timezone', 'timezone', 'player', 'get_messages'],
        where: {username: req.auth_obj.username}
    }).then(function (result) {
        result.timezone = (result.timezone<1) ? result.timezone : "+"+result.timezone;
        var response_data = [result];
        response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

exports.user_data = function(req, res) {
    models.login_data.findOne({
        attributes:['customer_id'],
        where: {username: req.auth_obj.username}
    }).then(function (result) {
        models.customer_data.findOne({
            attributes: ['firstname', 'lastname', 'email', 'address', 'city', 'country', 'telephone' ],
            where: {id: result.customer_id}
        }).then(function (result) {
            var response_data = [result];
            response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

//API UPDATES DATA FOR THIS USER, RETURNS STATUS
exports.update_user_data = function(req, res) {
    models.customer_data.findOne({
        attributes:['firstname', 'lastname', 'email'],
        where: {id: req.thisuser.customer_id}
    }).then(function (customer_data) {
        models.customer_data.update(
            {
                firstname : req.body.firstname,
                lastname  : req.body.lastname,
                email     : req.body.email,
                address   : req.body.address,
                city      : req.body.city,
                country   : req.body.country,
                telephone : req.body.telephone
            },
            {
                where: {id: req.thisuser.customer_id}
            }
        ).then(function (result) {
            if(result && customer_data.email !== req.body.email){
                var email_body = 'Dear '+customer_data.firstname+' '+customer_data.lastname+', the email address associated to your Magoware account has been changed to '+req.body.email;
                var smtpConfig = {
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: req.app.locals.settings.email_username,
                        pass: req.app.locals.settings.email_password
                    }
                };
                var smtpTransport = nodemailer.createTransport(smtpConfig);
                var mailOptions = {
                    from: req.app.locals.settings.email_username,
                    to: customer_data.email,
                    subject: 'Magoware email changed', // Subject line
                    text: email_body, // plaintext body
                    html: '<b>'+email_body+'</b>' // html body
                };
                smtpTransport.sendMail(mailOptions, function(error, info){
                    if(error) console.log(error);
                });
            }
            response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
        }).catch(function(error) {
            if(error.name === "SequelizeUniqueConstraintError" && error.errors[0].path === "email"){
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'EMAIL_ALREADY_EXISTS', 'no-store');
            }
            else{
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            }
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

//API UPDATES SETTINGS FOR THIS USER, RETURNS STATUS
exports.update_user_settings = function(req, res) {
    var salt = authentication.makesalt();
    var encrypted_password = authentication.encryptPassword(decodeURIComponent(req.body.password), salt);

    models.login_data.update(
        {
            password: encrypted_password,
            salt: salt,
            pin: req.body.pin,
            timezone: req.body.timezone,
            auto_timezone: req.body.auto_timezone,
            show_adult: req.body.show_adult,
            player: req.body.player,
            get_messages: req.body.get_messages,
            livetvlastchange: (req.thisuser.player.toUpperCase() !== req.body.player.toUpperCase()) ? Date.now() : req.thisuser.livetvlastchange //if player changes, livetv data should be updated
        },
        {where: {username: req.auth_obj.username}}
    ).then(function (result) {
        response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

exports.change_password = function(req, res) {
    var key = req.app.locals.settings.new_encryption_key;
    var plaintext_password = (req.auth_obj.appid === '3') ? authentication.decryptPassword(decodeURIComponent(req.body.password), key) : decodeURIComponent(req.body.password);
    var salt = authentication.makesalt();
    var encrypted_password = authentication.encryptPassword(plaintext_password, salt);

    models.login_data.update(
        {
            password: encrypted_password,
            salt: salt
        },
        {where: {username: req.auth_obj.username}}
    ).then(function (result) {
        response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};

exports.reset_pin = function(req, res) {
    models.customer_data.findOne({
        attributes:['firstname', 'lastname', 'email'],
        where: {id: req.thisuser.customer_id}
    }).then(function (result) {
        var email_body = 'Dear '+result.firstname+' '+result.lastname+', your current pin is '+req.thisuser.pin;
        var smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: req.app.locals.settings.email_username,
                pass: req.app.locals.settings.email_password
            }
        };
        var smtpTransport = nodemailer.createTransport(smtpConfig);
        var mailOptions = {
            from: req.app.locals.settings.email_username,
            to: result.email,
            subject: 'Pin information', // Subject line
            text: email_body, // plaintext body
            html: '<b>'+email_body+'</b>' // html body
        };
        smtpTransport.sendMail(mailOptions, function(error, info){
            if(error) console.log(error);
        });
        response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'RESET_PIN_DATA', 'no-store');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

//API GETS SUBSCRIPTION DATA
exports.subscription = function(req, res) {
    models.subscription.findAll({
        attributes: ['id', [db.sequelize.fn('date_format', db.sequelize.col('start_date'), '%Y-%m-%d %H:%m:%s'), 'start_date'],
            [db.sequelize.fn('date_format', db.sequelize.col('end_date'), '%Y-%m-%d %H:%m:%s'), 'end_date']],
        where: {customer_username: req.auth_obj.username},
        include: [{model: models.package, required: true, attributes:['package_name']}]
    }).then(function (result) {
        if(!result[0]){
            response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
        }
        else{
            //the following loop avoids nested response
            var subscription = []; //temp array where we store the values of the query
            for(var i = 0; i < result.length; i++){
                //for each object we store its values in a temp variable
                var temp_subscription_record = {
                    "package_name": result[i].package.package_name,
                    "start_date": result[i].start_date,
                    "end_date": result[i].end_date
                };
                subscription.push(temp_subscription_record); //the object is pushed to the temp array
            }
            response.send_res(req, res, subscription, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
        }

    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};


//API GETS SALEREPORT DATA
exports.salereport = function(req, res) {
    models.salesreport.findAll({
        attributes: ['user_username', 'distributorname', [db.sequelize.fn('date_format', db.sequelize.col('saledate'), '%Y-%m-%d %H:%m:%s'), 'saledate']],
        where: {user_username: req.auth_obj.username},
        include: [{model: models.combo, required: true, attributes:['duration', 'name']}]
    }).then(function (result) {
        //the following loop avoids nested response
        var salereport = []; //temp array where we store the values of the query
        for(var i = 0; i < result.length; i++){
            //for each object we store its values in a temp variable
            var temp_salereport_record = {
                "user_username": result[i].user_username,
                "distributorname": result[i].distributorname,
                "sale_date": result[i].saledate,
                "combo_name": result[i].combo.name,
                "combo_duration": result[i].combo.duration
            };
            salereport.push(temp_salereport_record); //the object is pushed to the temp array
        }
        response.send_res(req, res, salereport, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });

};


// returns list of genres
exports.genre = function(req, res) {
    models.genre.findAll({
        attributes: ['id',['description', 'name']],
        where: {is_available: true}
    }).then(function (result) {
        response.send_res(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};



/*******************************************************************
 Listing, adding, editing and deleting user channels
 *******************************************************************/
exports.add_channel = function(req, res) {
    models.login_data.findOne({
        attributes:['id'],
        where: {username: req.auth_obj.username}
    }).then(function (result) {
        models.my_channels.create({
            channel_number: 66666,
            login_id: result.id,
            title: req.body.title,
            genre_id: (req.body.genre_id) ? req.body.genre_id : 1,
            description: req.body.description,
            icon_url: '/images/do_not_delete/mago_logo.png',  //TODO: delete
            stream_url: req.body.stream ,
            isavailable: 1
        }).then(function (result) {
            var new_channel_number = result.id + 999; //smallest channel number will be 1000 (for id 0). This way conflicts are avoided with normal channel numbers, which are <= 999
            models.my_channels.update(
                {
                    channel_number: new_channel_number //set channel number equal to the unique number we created
                },
                {
                    where: {id: result.id} //for the recently added channel
                }
            ).then(function (result) {
                response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
            }).catch(function(error) {
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
            });
            return null;
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

//LIST QUERY. GET METHOD. No explicit parameter
exports.channel_list = function(req, res) {
    models.login_data.findOne({
        attributes:['id'],
        where: {username: req.auth_obj.username}
    }).then(function (result) {
        models.my_channels.findAll({
            attributes: ['channel_number', 'title', 'genre_id', 'description', 'stream_url', 'isavailable'],
            where: {login_id: result.id},
            include: [{ model: models.genre, required: true, attributes: ['icon_url'] }],
            raw: true
        }).then(function (result) {
            for (var i = 0; i < result.length; i++) {
                result[i].icon_url = req.app.locals.settings.assets_url + result[i]["genre.icon_url"];
                delete result[i]["genre.icon_url"];
            }
            response.send_res(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
        }).catch(function(error) {
            response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
        });
        return null;
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

//DELETE QUERY. PUT METHOD. channel_number as parameter
exports.delete_channel = function(req, res) {
    models.my_channels.destroy({
        where: {channel_number: req.body.channel_number}
    }).then(function (result) {
        response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

exports.edit_channel = function(req, res) {
    models.my_channels.update(
        {
            title: req.body.title,
            description: req.body.description,
            stream_url: req.body.stream_url,
            genre_id: (req.body.genre_id) ? req.body.genre_id : 1
        },
        {where: {channel_number: req.body.channel_number}}
    ).then(function (result) {
        response.send_res(req, res, [], 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
    }).catch(function(error) {
        response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

