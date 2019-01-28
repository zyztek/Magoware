'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('salesreport', 'active', {
                type: Sequelize.BOOLEAN,
                defaultValue: 1,
                allowNull: false
            })
            .catch(function(err) {winston.error('Adding column salesreport.active failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('salesreport', 'active')
            .catch(function(err) {winston.error('Removing column salesreport.active failed with error message: ',err.message);});
    }
};