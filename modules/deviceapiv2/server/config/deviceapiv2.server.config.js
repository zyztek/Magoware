'use strict';
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    winston = require(path.resolve('./config/lib/winston')),
    settings_DBModel = db.settings,
    advanced_settings_DBMmodel = db.advanced_settings,
    combo_DBMmodel = db.combo;


/**
 * Module init function.
 */
module.exports = function(app,   db) {

    settings_DBModel.findOne({

    }).then(function (result) {

        advanced_settings_DBMmodel.findAll({
            raw: true
        }).then(function (advancedsettings_results) {

            app.locals.settings = Object.assign(app.locals.settings, result.dataValues);
            app.locals.backendsettings = result.dataValues;
            app.locals.advancedsettings = advancedsettings_results;
            //find if transactional vod is active, and it's set duration
            combo_DBMmodel.findOne({
                attributes: ['duration'],
                where: {product_id: 'transactional_vod', isavailable: true}
            }).then(function (t_vod_combo) {
                if(t_vod_combo && t_vod_combo.duration) app.locals.backendsettings.t_vod_duration = t_vod_combo.duration;
                else app.locals.backendsettings.t_vod_duration = null;
            }).catch(function(error) {
                winston.error('error reading transactional vod settings: ',error);
            });
            return null;

        }).catch(function(error) {
            winston.error('error reading database settings: ',error);
        });
        return null;
    }).catch(function(error) {
        winston.error('error reading database settings: ',error);
    });

};

