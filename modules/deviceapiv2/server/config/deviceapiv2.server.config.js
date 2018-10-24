'use strict';
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    winston = require(path.resolve('./config/lib/winston')),
    DBModel = db.settings;

/**
 * Module init function.
 */
module.exports = function(app,   db) {

    DBModel.findOne({

    }).then(function (result) {
         app.locals.settings = Object.assign(app.locals.settings, result.dataValues);
         app.locals.backendsettings = result.dataValues;

    }).catch(function(error) {
         winston.error('error reading database settings: ',error);
    });

};
