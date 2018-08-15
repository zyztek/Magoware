'use strict';

module.exports = {

  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('channels', 'epg_map_id',{type: Sequelize.STRING(32), allowNull: true, defaultValue: ''})
        .catch(function(err) {console.log('Adding default value to column channels.epg_map_id failed with error message: ',err.message);});

  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('channels', 'epg_map_id',{type: Sequelize.STRING(32), allowNull: false})
        .catch(function(err) {console.log('Reverting default value to column channels.epg_map_id failed with error message: ',err.message);});

  }

};