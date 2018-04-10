'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('channel_stream', 'stream_mode',{type: Sequelize.STRING(20), allowNull: false}).then(function(updated_stream_mode){
      queryInterface.sequelize.query('UPDATE `channel_stream` AS `channel_stream` SET `channel_stream`.`stream_mode` = CONCAT(`channel_stream`.`stream_mode`, "_large");')
      console.log('Column stream_mode was adapted to include resolution');
    }).catch(function(err) {
      console.log('Updating column channel_stream.stream_mode to describe resolution failed with error message: ',err.message);
    });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('channel_stream', 'stream_mode',{type: Sequelize.STRING(10), allowNull: false}).then(function(updated_stream_mode){
      console.log('Column stream_mode reverted to describe only live/catchup mode');
    }).catch(function(err) {console.log('Reverting column stream_mode to describe only live/catchup mode failed with error message:: ',err.message);});
  }
};