'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('channel_stream', 'recording_engine', {
                type: Sequelize.STRING(20),
                allowNull: false
            })
            .catch(function(err) {winston.error('Adding column channel_stream.recording_engine failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('channel_stream', 'recording_engine')
            .catch(function(err) {winston.error('Removing column channel_stream.recording_engine failed with error message: ',err.message);});
    }
};