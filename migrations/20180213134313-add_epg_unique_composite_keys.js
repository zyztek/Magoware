'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addIndex('epg_data', ['program_start', 'channel_number'], {unique: true})
        .catch(function(err) {console.log('Adding unique constraint on program_start_channel_number failed with error message: ',err.message);});
    queryInterface.addIndex('epg_data', ['program_end', 'channel_number'], {unique: true})
        .catch(function(err) {console.log('Adding unique constraint on program_end_channel_number failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeIndex('epg_data', ['program_start', 'channel_number'], {unique: true})
        .catch(function(err) {console.log('Removing unique constraint on program_start_channel_number failed with error message: ',err.message);});
    queryInterface.removeIndex('epg_data', ['program_end', 'channel_number'], {unique: true})
        .catch(function(err) {console.log('Removing unique constraint on program_end_channel_number failed with error message: ',err.message);});
  }
};
