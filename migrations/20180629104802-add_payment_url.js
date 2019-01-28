'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('settings', 'online_payment_url', {
                type: Sequelize.STRING(255),
                allowNull: false,
                defaultValue: '',
                after: 'help_page'
            })
            .catch(function (err) {
                winston.error('Adding column settings.online_payment_url failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('settings', 'online_payment_url')
            .catch(function (err) {
                winston.error('Dropping settings users.online_payment_url failed with error message: ', err.message);
            });
    }
};