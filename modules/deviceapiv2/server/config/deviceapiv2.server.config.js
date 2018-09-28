'use strict';
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    winston = require(path.resolve('./config/lib/winston')),
    DBModel = db.settings,
    advanced_settings = db.advanced_settings;

/**
 * Module init function.
 */
module.exports = function(app,   db) {

    advanced_settings.findAll({ raw: true }).then(function (advanced_settings) {
        DBModel.findOne({}).then(function (result) {
            app.locals.settings = Object.assign(app.locals.settings, result.dataValues);
            app.locals.backendsettings = result.dataValues;
            app.locals.configurations = advanced_settings;
        }).catch(function(error) {
            winston.error('error reading database settings: ',error);
        });
        return null;
    }).catch(function(error) {
        winston.error('error reading advanced settings: ',error);
    });

};
