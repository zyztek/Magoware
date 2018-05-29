'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('vod', 'imdb_id',{type: Sequelize.STRING(25), allowNull: true})
        .catch(function(err) {console.log('Adding column vod.imdb_id failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('vod', 'imdb_id')
        .catch(function(err) {console.log('Removing column vod.imdb_id failed with error message: ',err.message);});
  }
};