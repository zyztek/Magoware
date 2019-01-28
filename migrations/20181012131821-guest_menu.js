'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('device_menu', 'is_guest_menu', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                after: 'locale'
        }).catch(function (err) {
            winston.error('Adding column device_menu.is_guest_menu failed with error message: ', err.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('device_menu', 'is_guest_menu')
            .catch(function (err) {
                winston.error('Removing column device_menu.is_guest_menu failed with error message: ', err.message);
            });
    }
};