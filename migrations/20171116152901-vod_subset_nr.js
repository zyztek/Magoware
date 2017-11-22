'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('settings', 'vod_subset_nr',{type: Sequelize.INTEGER(11), defaultValue: 200, allowNull: false})
        .catch(function(err) {console.log('Adding column settings.vod_subset_nr failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('settings', 'vod_subset_nr')
        .catch(function(err) {console.log('Removing column settings.vod_subset_nr failed with error message: ',err.message);});
  }
};