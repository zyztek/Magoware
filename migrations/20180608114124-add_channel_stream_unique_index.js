'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addIndex('channel_stream', ['channel_id', 'stream_source_id', 'stream_mode', 'stream_resolution'], {
            name: 'unique_channel_stream',
            unique: true
        }).then(function (added_index) {
            winston.info("Successfully created index unique_channel_stream");
        }).catch(function(error){
            winston.error("Creating index unique_channel_stream failed with error: ",error.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeIndex('channel_stream', 'unique_channel_stream').then(function (remove_new_index) {
            winston.error("Successfully deleted new index unique_channel_stream");
        }).catch(function(error){
            winston.error("Removing new index unique_channel_stream failed with error: ",error.message);
        });
    }
};
