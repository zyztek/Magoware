'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('vod', 'category_id').catch(function(err) {console.log('Dropping column vod.category_id failed with error message: ',err.message);});
  }
};

