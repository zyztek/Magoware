'use strict';

var
    path = require('path'),
    config = require(path.resolve('./config/config')),
    acl = require('acl');

var jwt = require('jsonwebtoken'),
    jwtSecret = "thisIsMySecretPasscode",
    jwtIssuer = "mago-dev";

var db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.grouprights;

var systemroutes = require(path.resolve('./modules/mago/server/policies/systemroutes.json'));
var grouprights = require(path.resolve('./modules/mago/server/controllers/grouprights.server.controller.js'));

var winston = require('winston');

/**
 * Module dependencies.
 */

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Mago Tables Permissions
 */
exports.invokeRolesPolicies = function() {
    acl.allow('admin', systemroutes, '*');
    acl.allow('guest', systemroutes, 'get');
    acl.allow('finance', systemroutes, '*');
};

/**
 * Check If Policy Allows
 */
exports.isAllowed = function(req, res, next) {

    var aHeader = req.get("Authorization");

    //Check if this request is signed by a valid token
    var token = null;
    if (typeof aHeader != 'undefined')
        token = aHeader;

    try {
        var decoded = jwt.verify(token, jwtSecret);
        req.token = decoded;
    } catch (err) {
        return res.status(403).json({
            message: 'User is not allowed'
        });
    }

    var roles = (req.token) ? req.token.role : ['guest'];

    // Check for user roles
    //todo: must be called in each request, not just list.
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {

        if (err) {
            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        }

        else if(roles === 'admin'){
            return next();
        }

        else{
            var where_condition = {};

            if(req.method === 'GET') {
                where_condition.where = {read: 1};
                var api_url = (req.url.indexOf('?') !== -1) ? req.url.split('?')[0] : req.url.slice(0, req.url.lastIndexOf('/')); //get method allows read of list of data, or read of single record
            }
            if(req.method === 'POST') {
                where_condition.where = {create: 1};
                var api_url = req.url;
            }
            if(req.method === 'PUT'){
                where_condition.where = {edit: 1};
                var api_url = req.url.slice(0, req.url.lastIndexOf('/'));
            }

            where_condition.attributes = ['id'];
            where_condition.include = [
                {model: db.groups, required: true, attributes: [], where: {code: roles }},
                {model: db.api_group, required: true, attributes: ['api_group_name'],
                    include: [{model: db.api_url, required: true, attributes: ['api_url'], where: {api_url: {like: api_url}}}]
                }
            ];
            db.grouprights.findAll(where_condition).then(function(result) {
                if (!result || result.length === 0) {
                    if(roles === 'admin'){
                        return next();
                    }
                    else {
                        return res.status(404).json({
                            message: 'User not authorized'
                        });
                    }
                } else {
                    next();
                    return null;
                }
            }).catch(function(err) {
                winston.error(err);
                return res.status(404).json({
                    message: 'User is not authorized'
                });
            });
        }
    });
};


// function to verify API KEY for third party integrations.

exports.isApiKeyAllowed = function(req, res, next) {

    let apikey = req.query.apikey;

    db.users.findOne({
        where: {
                jwtoken: apikey,
                isavailable: true
                }
    }).then(function(result) {
        if(result) {
           req.token = result;
           next()
        }
        else {
           return res.status(403).json({
            message: 'API key not authorized'
           });
        }
        return null;
    }).catch(function(err) {
        winston.error(err);
        return res.status(404).json({
            message: 'API key not authorized'
        });
    });
}
