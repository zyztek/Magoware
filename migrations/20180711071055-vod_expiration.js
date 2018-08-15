'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('vod', 'expiration_time',{type: Sequelize.DATE, defaultValue: '2019:01:01 00:00:00', after: 'default_subtitle_id'})
        .catch(function(err) {console.log('Adding column vod.expiration_time failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('vod', 'expiration_time')
        .catch(function(err) {console.log('Dropping column vod.expiration_time failed with error message: ',err.message);});
  }
};