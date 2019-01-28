'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'device_menu',
            'applications',
            {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: '1,2,3,4,5'
            }
        ).then(function () {
            queryInterface.sequelize.query('delete from device_menu where appid > 1;');
        }).catch(function (err) {
            winston.error('Migration failed with error message: ', err.message);
        });
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.removeColumn('device_menu', 'applications').catch(function (err) {
          winston.error('Removing column device_menu.applications failed with error message: ', err.message);
      });
  }
};
