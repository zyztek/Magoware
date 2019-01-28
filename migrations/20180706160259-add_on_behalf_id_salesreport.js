'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('salesreport', 'on_behalf_id', {type: Sequelize.INTEGER(11), allowNull: true})
            .catch(function(err) {winston.error('Adding column salesreport.on_behalf_id failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('salesreport', 'on_behalf_id')
            .catch(function(err) {winston.error('Removing column salesreport.on_behalf_id failed with error message: ',err.message);});
    }
};