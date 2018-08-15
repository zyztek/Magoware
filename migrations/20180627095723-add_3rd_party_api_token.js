'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('users', 'third_party_api_token',{type: Sequelize.STRING(255), allowNull: false, defaultValue: '', after: 'address'})
        .catch(function(err) {console.log('Adding column users.third_party_api_token failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('users', 'third_party_api_token',{type: Sequelize.INTEGER(255)})
        .catch(function(err) {console.log('Dropping column users.third_party_api_token failed with error message: ',err.message);});
  }
};