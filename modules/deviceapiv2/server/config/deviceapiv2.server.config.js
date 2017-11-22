'use strict';
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.settings;

/**
 * Module init function.
 */
module.exports = function(app,   db) {

    DBModel.findOne({

    }).then(function (result) {
        app.locals.settings = result;
    }).catch(function(error) {
        //todo: handdle error
    });

};
