'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod_stream', 'stream_format', {
            type: Sequelize.STRING(2),
            defaultValue: 0,
            allowNull: false
        }).then(function (success) {
            return queryInterface.addColumn('vod_stream', 'encryption_url', {
                    type: Sequelize.STRING(255),
                    defaultValue: '',
                    allowNull: false
                })
                .catch(function (err) {
                    winston.error('Adding column vod_stream.encryption_url failed with error message: ', err.message);
                });
        }).catch(function (err) {
            winston.error('Adding column vod_stream.stream_format failed with error message: ', err.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod_stream', 'stream_format').then(function (success) {
            return queryInterface.removeColumn('vod_stream', 'encryption_url')
                .catch(function (err) {
                    winston.error('Removing column settings.encryption_url failed with error message: ', err.message);
                });
        }).catch(function (err) {
            winston.error('Removing column settings.stream_format failed with error message: ', err.message);
        });
    }
};