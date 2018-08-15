'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addIndex('channel_stream', ['channel_id', 'stream_source_id', 'stream_mode', 'stream_resolution'], {name: 'unique_channel_stream', unique: true}).then(function(added_index){
            console.log("Successfully created index unique_channel_stream");
        }).catch(function(error){
            console.log("Creating index unique_channel_stream failed with error: ",error.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeIndex('channel_stream', 'unique_channel_stream').then(function(remove_new_index){
            console.log("Successfully deleted new index unique_channel_stream");
        }).catch(function(error){
            console.log("Removing new index unique_channel_stream failed with error: ",error.message);
        });
    }
};
