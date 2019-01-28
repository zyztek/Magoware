'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('settings', 'help_page', {
                type: Sequelize.STRING(255),
                defaultValue: '',
                allowNull: false
            })
            .catch(function (err) {
                winston.error('Adding column settings.help_page failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('settings', 'help_page')
            .catch(function (err) {
                winston.error('Removing column settings.help_page failed with error message: ', err.message);
            });
    }
};