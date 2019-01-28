
var path = require('path'),
    request = require('request'),
    queryString = require('querystring'),
    config = require(path.resolve('./modules/account-kit/server/config')),
    customerFunctions = require(path.resolve('./custom_functions/customer_functions')),
    authenticationHandler = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller')),
    response = require(path.resolve("./config/responses.js"));

const crypto = require('crypto');
var csrf = 'qwertzuio';
const me_endpoint_base_url = 'https://graph.accountkit.com/' + config.api_version + '/me';
const token_exchange_base_url = 'https://graph.accountkit.com/' + config.api_version + '/access_token'; 

exports.handleRenderLoginForm = function(req, res) {
    const address = req.protocol + '://' + req.get('host');
    res.render(path.resolve('modules/account-kit/server/templates/login'), {
        server_address: address
    });
}

exports.handleLoginSuccess = function(req, res) {
    if (req.query.state === csrf && req.query.status === 'PARTIALLY_AUTHENTICATED') {
        var app_access_token = ['AA', config.app_id, config.app_secret].join('|');
        var params = {
          grant_type: 'authorization_code',
          code: req.query.code,
          access_token: app_access_token
        };

        // exchange tokens
        var token_exchange_url = token_exchange_base_url + '?' + queryString.stringify(params);
        request.get({url: token_exchange_url, json: true}, function(err, resp, respBody) {
            if (respBody.access_token) {
                handleAuthSuccess(req, res, respBody.access_token);
            }
            else {
                let r = new response.OK();
                r.status_code=400
                r.error_code = -1;
                r.error_description = 'USER_NOT_FOUND'
                res.send(r);
            }
        });
    }
    else if (req.query.access_token) {
        handleAuthSuccess(req, res, req.query.access_token)
    }
    else {
        let r = new response.OK();
        r.status_code=400
        r.error_code = -1;
        r.error_description = 'BAD_REQUEST'
        res.send(r);
    }
}

function handleAuthSuccess(req, res, access_token) {
    // get account details at /me endpoint
    var me_endpoint_url = me_endpoint_base_url + '?access_token=' + access_token;
    request.get({ url: me_endpoint_url, json: true }, function (err, resp, respBody) {
        let username;
        let isEmail = false;

        if (respBody.phone) {
            username = respBody.phone.number;
            username = username.substring(1, username.length)
        } else if (respBody.email) {
            username = respBody.email.address;
            isEmail = true;
        } else {
            let r = new response.OK();
            r.status_code=702
            r.error_code = -1;
            r.error_description = 'USER_NOT_FOUND'
            res.send(r);
            return;
        }

        //add user
        req.body = {};
        req.body.firstname = '';
        req.body.lastname = '';
        req.body.address = '';
        req.body.city = '';
        req.body.country = '';
        req.body.telephone = '';

        req.body.email = isEmail ? username : '';
        req.body.username = username;

        req.body.salt = authenticationHandler.makesalt();
        let password = username//crypto.randomBytes(4).toString('hex').slice(0, 8);
        req.body.password = password;
        req.body.channel_stream_source_id = (req.body.channel_stream_source_id) ? req.body.channel_stream_source_id : 1;
        req.body.vod_stream_source = (req.body.vod_stream_source) ? req.body.vod_stream_source : 1;
        req.body.pin = (req.body.pin) ? req.body.pin : 1234;
        customerFunctions.find_or_create_customer_and_login(req, res)
            .then(function (customer) {
                if (customer.status) {
                    let user = {
                        'username': username,
                        'password': password
                    }
                    let responseMsg = new response.OK();
                    responseMsg.extra_data = 'user';
                    responseMsg.response_object = [ user ];
                    res.send(responseMsg);
                } else {
                    let r = response.OK();
                    r.status_code=400
                    r.error_code = -1;
                    r.error_description = 'USER_NOT_FOUND'
                    res.send(r);    
                }
            }).catch(function (err) {
                res.send({ status: false });
            });
    });    
}

