'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod', 'trailer_url', {
            type: Sequelize.STRING(255),
            allowNull: false,
            defaultValue: '',
            after: 'starring'
        }).then(function (success) {
            return queryInterface.addColumn('vod', 'vod_preview_url', {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    defaultValue: '',
                    after: 'starring'
                })
                .catch(function (err) {
                    winston.error('Adding column vod.vod_preview_url failed with error message: ', err.message);
                });
        }).catch(function (err) {
            winston.error('Adding column vod.trailer_url failed with error message: ', err.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod', 'trailer_url').then(function (success) {
            return queryInterface.addColumn('vod', 'vod_preview_url')
                .catch(function (err) {
                    winston.error('Adding column vod.vod_preview_url failed with error message: ', err.message);
                });
        }).catch(function (err) {
            winston.error('Adding column vod.trailer_url failed with error message: ', err.message);
        });
    }
};