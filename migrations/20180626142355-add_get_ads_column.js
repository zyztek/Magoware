'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('login_data', 'get_ads',{type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, after: 'get_messages'})
        .catch(function(err) {console.log('Adding column login_data.get_ads failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('login_data', 'get_ads')
        .catch(function(err) {console.log('Removing column login_data.get_ads failed with error message: ',err.message);});
  }
};