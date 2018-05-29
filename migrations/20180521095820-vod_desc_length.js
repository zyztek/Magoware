'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('vod', 'description',{type: Sequelize.STRING(280), allowNull: false})
        .catch(function(err) {console.log('Changing vod.description length to 280 characters failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('vod', 'description',{type: Sequelize.STRING(255), allowNull: false})
        .catch(function(err) {console.log('Changing vod.rate description length to 255 characters failed with error message: ',err.message);});
  }
};
