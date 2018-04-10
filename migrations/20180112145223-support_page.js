'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('settings', 'help_page',{type: Sequelize.STRING(255), defaultValue: '', allowNull: false})
        .catch(function(err) {console.log('Adding column settings.help_page failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('settings', 'help_page')
        .catch(function(err) {console.log('Removing column settings.help_page failed with error message: ',err.message);});
  }
};