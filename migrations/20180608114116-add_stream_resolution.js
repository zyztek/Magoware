'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('channel_stream', 'stream_resolution', {
            type: Sequelize.STRING(30),
            after: 'stream_format',
            allowNull: false,
            default: 'small,large'
        }).then(function (added_column) {
            winston.info("Successfully added column channel_stream.stream_resolution.");
        }).catch(function(error){
            winston.error("Adding column channel_stream.stream_resolution failed with error: ",error.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('channel_stream', 'stream_resolution').then(function (removed_old_index) {
            winston.info("Successfully deleted column channel_stream.stream_resolution");
        }).catch(function(error){
            winston.error("Deleting column channel_stream.stream_resolution failed with error: ",error.message);
        });
    }
};
