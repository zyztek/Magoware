'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('epg_data', 'event_rating',{type: Sequelize.INTEGER(11)})
        .catch(function(err) {console.log('Adding column epg_data.event_rating failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('epg_data', 'event_rating')
        .catch(function(err) {console.log('Removing column epg_data.event_rating failed with error message: ',err.message);});
  }
};