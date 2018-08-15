'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('vod', 'default_subtitle_id',{type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0})
        .catch(function(err) {console.log('Adding column vod.default_subtitle_id failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('vod', 'default_subtitle_id')
        .catch(function(err) {console.log('Removing column vod.default_subtitle_id failed with error message: ',err.message);});
  }
};