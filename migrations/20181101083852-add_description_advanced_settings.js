'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('advanced_settings', 'description', {
                type: Sequelize.STRING(500),
                allowNull: true
            })
            .catch(function(err) {winston.error('Adding column advanced_settings.description failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('advanced_settings', 'description')
            .catch(function(err) {winston.error('Removing column advanced_settings.description failed with error message: ',err.message);});
    }
};