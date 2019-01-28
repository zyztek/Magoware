'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('customer_data', 'zip_code', {
                type: Sequelize.STRING(10),
                defaultValue: '',
                after: 'country'
            })
            .then(function (success) {
                return queryInterface.addColumn('login_data', 'mac_address', {
                    type: Sequelize.STRING(12),
                    defaultValue: '',
                    after: 'username'
                }).catch(function (err) {
                    winston.error('Adding column login_data.mac_address failed with error message: ', err.message);
                });
            })
            .catch(function (err) {
                winston.error('Adding column customer_data.zip_code failed with error message: ', err);
            });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('customer_data', 'zip_code')
            .then(function (success) {
                return queryInterface.removeColumn('login_data', 'mac_address').catch(function (err) {
                    winston.error('Dropping column login_data.mac_address failed with error message: ', err.message);
                });
            })
            .catch(function (err) {
                winston.error('Dropping column customer_data.zip_code failed with error message: ', err.message);
            });

    }
};