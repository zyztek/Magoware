'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('settings', 'online_payment_url',{type: Sequelize.STRING(255), allowNull: false, defaultValue: '', after: 'help_page'})
        .catch(function(err) {console.log('Adding column settings.online_payment_url failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('settings', 'online_payment_url')
        .catch(function(err) {console.log('Dropping settings users.online_payment_url failed with error message: ',err.message);});
  }
};