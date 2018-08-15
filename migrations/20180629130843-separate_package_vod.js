'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('vod', 'package_id')
        .catch(function(err) {console.log('Removing column package_vod.package_id failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.addColumn('vod', 'package_id',{type: Sequelize.INTEGER(11), allowNull: false, after: 'title', defaultValue: 1})
        .catch(function(err) {console.log('Adding column vod.package_id failed with error message: ',err.message);});
  }
};