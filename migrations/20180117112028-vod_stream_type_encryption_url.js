'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('vod_stream', 'stream_format',{type: Sequelize.STRING(2), defaultValue: 0, allowNull: false})
        .catch(function(err) {console.log('Adding column vod_stream.stream_format failed with error message: ',err.message);});
    queryInterface.addColumn('vod_stream', 'encryption_url',{type: Sequelize.STRING(255), defaultValue: '', allowNull: false})
        .catch(function(err) {console.log('Adding column vod_stream.encryption_url failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('vod_stream', 'stream_format')
        .catch(function(err) {console.log('Removing column settings.stream_format failed with error message: ',err.message);});
    queryInterface.removeColumn('vod_stream', 'encryption_url')
        .catch(function(err) {console.log('Removing column settings.encryption_url failed with error message: ',err.message);});
  }
};