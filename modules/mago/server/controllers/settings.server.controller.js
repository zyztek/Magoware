'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    dateFormat = require('dateformat'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    winston = require('winston'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    merge = require('merge'),
    DBModel = db.settings,
    config = require(path.resolve('./config/config'));


/**
 * Show current
 */


exports.read = function(req, res) {
    res.json(req.settings);
};

exports.env_settings = function(req, res) {
    var env_settings = {
        "backoffice_version" : config.seanjs.version+' '+config.seanjs.db_migration_nr,
        "company_name": req.app.locals.settings.company_name,
        "company_logo": req.app.locals.settings.assets_url+req.app.locals.settings.company_logo
    };
    res.json(env_settings); //returns version number and other middleware constants
};

/**
 * Update
 */

exports.update = function(req, res) {
    var new_settings = {}; //final values of settings will be stored here
    var new_setting = {}; //temporary timestamps will be stored here

    var updateData = req.settings;

    //for each activity, if the checkbox was checked, store the current timestamp at the temporary object. Otherwise delete it so that it won't be updated
    //LIVE TV
    if(req.body.updatelivetvtimestamp === true){
        delete req.body.livetvlastchange;
        new_setting.livetvlastchange = Date.now();
    }
    else delete req.body.livetvlastchange;
    //MAIN MENU
    if(req.body.updatemenulastchange){
        delete req.body.menulastchange;
        new_setting.menulastchange = Date.now()
    }
    else delete req.body.menulastchange;
    //VOD
    if(req.body.updatevodtimestamp){
        delete req.body.vodlastchange;
        new_setting.vodlastchange = Date.now()
    }
    else delete req.body.vodlastchange;

    new_settings = merge(req.body, new_setting); //merge values left @req.body with values stored @temp object into a new object
    logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(new_settings)); //write new values in logs

    updateData.updateAttributes(new_settings).then(function(result) {

        //refresh company settings in app memory
        delete req.app.locals.settings;
        req.app.locals.settings = result;
        delete req.app.locals.backendsettings;
        req.app.locals.backendsettings = result;

        return res.json(result);
    }).catch(function(err) {
        winston.error("Updating setting failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.settings;
    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {
            result.destroy().then(function() {
                return res.json(result);
            }).catch(function(err) {
                winston.error("Deleting this setting failed with error: ", err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        } else {
            return res.status(400).send({
                message: 'Unable to find the Data'
            });
        }
    }).catch(function(err) {
        winston.error("Getting setting object failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * List
 */
exports.list = function(req, res) {
    DBModel.findAll({
        offset: 5,
        limit: 20,
        include: []
    }).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {
            res.json(results);
        }
    }).catch(function(err) {
        winston.error("Getting setting list failed with error: ", err);
        res.jsonp(err);
    });
};

/**
 * middleware
 */
exports.dataByID = function(req, res, next, id) {

    if ((id % 1 === 0) === false) { //check if it's integer
        return res.status(404).send({
            message: 'Data is invalid'
        });
    }

    DBModel.find({
        where: {
            id: id
        },
        include: []
    }).then(function(result) {
        if (!result) {
            return res.status(404).send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.settings = result;
            req.app.locals.settings = result; //update settings on app when changed from UI
            req.app.locals.backendsettings = result; //update settings on app when changed from UI
            next();
            return null;
        }
    }).catch(function(err) {
        winston.error("Getting setting data failed with error: ", err);
        return next(err);
    });

};