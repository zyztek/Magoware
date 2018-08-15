'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('users', 'password')
        .catch(function(err) {console.log('Removing column users.password failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.addColumn('users', 'password',{type: Sequelize.STRING, defaultValue: '', after: 'username'})
        .catch(function(err) {console.log('Adding column users.password failed with error message: ',err.message);});
  }
};