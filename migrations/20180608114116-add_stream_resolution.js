'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('channel_stream', 'stream_resolution', {type: Sequelize.STRING(30), after: 'stream_format', allowNull: false, default: 'small,large'}).then(function(added_column){
            console.log("Successfully added column channel_stream.stream_resolution.");
        }).catch(function(error){
            console.log("Adding column channel_stream.stream_resolution failed with error: ",error.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('channel_stream', 'stream_resolution').then(function(removed_old_index){
            console.log("Successfully deleted column channel_stream.stream_resolution");
        }).catch(function(error){
            console.log("Deleting column channel_stream.stream_resolution failed with error: ",error.message);
        });
    }
};
