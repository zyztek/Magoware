'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.removeIndex('channel_stream', 'channelid_channelstream').then(function(removed_old_index){
            console.log("Successfully removed old index channelid_channelstream");
        }).catch(function(error){
            console.log("Removing old index channelid_channelstream failed with error: ",error.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.addIndex('channel_stream', ['channel_id', 'stream_source_id', 'stream_mode'], {name: 'channelid_channelstream', unique: true}).then(function(added_old_index){
            console.log("Successfully added old index channelid_channelstream");
        }).catch(function(error){
            console.log("Adding old index channelid_channelstream failed with error: ",error.message);
        });
    }
};
