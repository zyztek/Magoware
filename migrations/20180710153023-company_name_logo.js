'use strict';
var winston = require('winston');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('settings', 'company_logo',{type: Sequelize.STRING(255), allowNull: false, defaultValue: '/admin/images/mago.png', after: 'company_url'})
        .catch(function(err) {winston.error('Adding column settings.company_logo failed with error message: ',err.message);});
    return queryInterface.addColumn('settings', 'company_name',{type: Sequelize.STRING(45), allowNull: false, defaultValue: "MAGOWARE", after: 'company_url'})
        .catch(function(err) {winston.error('Adding column settings.company_name failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('settings', 'company_logo')
        .catch(function(err) {winston.error('Dropping column settings.company_logo failed with error message: ',err.message);});
    return queryInterface.removeColumn('settings', 'company_name')
        .catch(function(err) {winston.error('Dropping column settings.company_name failed with error message: ',err.message);});
  }
};