'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('settings', 'allow_guest_login', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                after: 'key_transition'
            })
            .catch(function (err) {
                winston.error('Adding column settings.allow_guest_login failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('settings', 'allow_guest_login')
            .catch(function (err) {
                winston.error('Removing column settings.allow_guest_login failed with error message: ', err.message);
            });
    }
};