'use strict';

module.exports = {

  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('channels', 'epg_map_id',{type: Sequelize.STRING(32), after:'title', allowNull: false})
        .catch(function(err) {console.log('Adding column channels.epg_map_id failed with error message: ',err.message);});

  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('channels', 'epg_map_id')
        .catch(function(err) {console.log('Removing column channels.epg_map_id failed with error message: ',err.message);});

  }

};