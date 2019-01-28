'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('salesreport', 'transaction_id', {
                type: Sequelize.STRING(128),
                allowNull: true,
                defaultValue: ''
            })
            .catch(function (err) {
                winston.error('Adding default value to column salesreport.transaction_id failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('salesreport', 'transaction_id', {
                type: Sequelize.STRING(128),
                allowNull: false
            })
            .catch(function (err) {
                winston.error('Reverting default value to column salesreport.transaction_id failed with error message: ', err.message);
            });
    }
};