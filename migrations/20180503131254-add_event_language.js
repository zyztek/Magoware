'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('epg_data', 'event_language',{type: Sequelize.STRING(10), defaultValue: '-'})
        .catch(function(err) {console.log('Adding column epg_data.event_language failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('epg_data', 'event_language')
        .catch(function(err) {console.log('Removing column epg_data.event_language failed with error message: ',err.message);});
  }
};