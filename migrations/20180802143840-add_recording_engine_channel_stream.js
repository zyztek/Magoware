'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('channel_stream', 'recording_engine',{type: Sequelize.STRING(20), allowNull: false})
            .catch(function(err) {console.log('Adding column channel_stream.recording_engine failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('channel_stream', 'recording_engine')
            .catch(function(err) {console.log('Removing column channel_stream.recording_engine failed with error message: ',err.message);});
    }
};