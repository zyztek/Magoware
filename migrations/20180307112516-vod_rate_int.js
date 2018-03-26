'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('vod', 'rate',{type: Sequelize.INTEGER(11), allowNull: false})
        .catch(function(err) {console.log('Changing vod.rate datatype from double to int failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('vod', 'rate',{type: Sequelize.DOUBLE, allowNull: false})
        .catch(function(err) {console.log('Changing vod.rate datatype from int to double failed with error message: ',err.message);});
  }
};