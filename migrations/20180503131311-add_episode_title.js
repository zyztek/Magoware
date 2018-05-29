'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('epg_data', 'episode_title',{type: Sequelize.STRING(45), defaultValue: '-'})
        .catch(function(err) {console.log('Adding column epg_data.episode_title failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('epg_data', 'episode_title')
        .catch(function(err) {console.log('Removing column epg_data.episode_title failed with error message: ',err.message);});
  }
};