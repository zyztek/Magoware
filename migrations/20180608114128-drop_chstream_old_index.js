'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.removeIndex('channel_stream', 'channelid_channelstream').then(function (removed_old_index) {
            winston.info("Successfully removed old index channelid_channelstream");
        }).catch(function(error){
            winston.error("Removing old index channelid_channelstream failed with error: ",error.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.addIndex('channel_stream', ['channel_id', 'stream_source_id', 'stream_mode'], {
            name: 'channelid_channelstream',
            unique: true
        }).then(function (added_old_index) {
            winston.error("Successfully added old index channelid_channelstream");
        }).catch(function(error){
            winston.error("Adding old index channelid_channelstream failed with error: ",error.message);
        });
    }
};
