'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('login_data', 'get_ads', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                after: 'get_messages'
            })
            .catch(function (err) {
                winston.error('Adding column login_data.get_ads failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('login_data', 'get_ads')
            .catch(function (err) {
                winston.error('Removing column login_data.get_ads failed with error message: ', err.message);
            });
    }
};