'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'api_url',
            'api_group_id',
            {
                type: Sequelize.STRING,
                allowNull: true
            }
        ).catch(function (err) {
            winston.error('Migration failed with error message: ', err.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('api_url', 'api_group_id').catch(function (err) {
            winston.error('Removing column device_menu.applications failed with error message: ', err.message);
        });
    }
};
