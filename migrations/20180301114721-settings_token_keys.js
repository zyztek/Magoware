'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('settings', 'akamai_token_key', {
            type: Sequelize.STRING(255),
            defaultValue: 'akamai_token_key',
            allowNull: false
        }).then(function (success) {
            return queryInterface.addColumn('settings', 'flussonic_token_key', {
                    type: Sequelize.STRING(255),
                    defaultValue: 'flussonic_token_key',
                    allowNull: false
                })
                .catch(function (err) {
                    winston.error('Adding column settings.flussonic_token_key failed with error message: ', err.message);
                });
        }).catch(function (err) {
            winston.error('Adding column settings.akamai_token_key failed with error message: ', err.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('settings', 'akamai_token_key').then(function (success) {
            return queryInterface.removeColumn('settings', 'flussonic_token_key')
                .catch(function (err) {
                    winston.error('Removing column settings.flussonic_token_key failed with error message: ', err.message);
                });
        }).catch(function (err) {
            winston.error('Removing column settings.akamai_token_key failed with error message: ', err.message);
        });
    }
};