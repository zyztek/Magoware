'use strict';
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    winston = require(path.resolve('./config/lib/winston')),
    settings_DBModel = db.settings,
    advanced_settings_DBMmodel = db.advanced_settings;


/**
 * Module init function.
 */
module.exports = function(app,   db) {

    settings_DBModel.findOne({

    }).then(function (result) {

        advanced_settings_DBMmodel.findAll({
            raw: true
        }).then(function (results) {

            app.locals.settings = Object.assign(app.locals.settings, result.dataValues);
            app.locals.backendsettings = result.dataValues;
            app.locals.advancedsettings = results;

        }).catch(function(error) {
            winston.error('error reading database settings: ',error);
        });
        return null;
    }).catch(function(error) {
        winston.error('error reading database settings: ',error);
    });

};

