'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('device_menu', 'position',{type: Sequelize.INTEGER(11), allowNull: false, unique: true})
        .catch(function(err) {console.log('Adding unique index to device_menu.position failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('device_menu', 'position',{type: Sequelize.INTEGER(11), allowNull: false})
        .catch(function(err) {console.log('Dropping unique index to device_menu.position failed with error message: ',err.message);});
  }
};