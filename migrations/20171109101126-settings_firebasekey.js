'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('settings', 'firebase_key', {
                type: Sequelize.STRING(255),
                defaultValue: '',
                allowNull: false
            })
            .catch(function (err) {
                winston.error('Adding column settings.firebase_key failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('settings', 'firebase_key')
            .catch(function (err) {
                winston.error('Removing column settings.firebase_key failed with error message: ', err.message);
            });
    }
};