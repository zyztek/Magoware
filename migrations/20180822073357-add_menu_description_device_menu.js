'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('device_menu', 'menu_description', {
                type: Sequelize.STRING(256),
                allowNull: false
            })
            .catch(function(err) {winston.error('Adding column device_menu.menu_description failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('device_menu', 'menu_description')
            .catch(function(err) {winston.error('Removing column device_menu.menu_description failed with error message: ',err.message);});
    }
};