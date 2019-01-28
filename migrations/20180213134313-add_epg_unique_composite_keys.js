'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addIndex('epg_data', ['program_start', 'channel_number'], {unique: true}).then(function (success) {
            return queryInterface.addIndex('epg_data', ['program_end', 'channel_number'], {unique: true})
                .catch(function (err) {
                    winston.error('Adding unique constraint on program_end_channel_number failed with error message: ', err.message);
                });
        }).catch(function (err) {
            winston.error('Adding unique constraint on program_start_channel_number failed with error message: ', err.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeIndex('epg_data', ['program_start', 'channel_number'], {unique: true}).then(function (success) {
            return queryInterface.removeIndex('epg_data', ['program_end', 'channel_number'], {unique: true})
                .catch(function (err) {
                    winston.error('Removing unique constraint on program_end_channel_number failed with error message: ', err.message);
                });
        }).catch(function (err) {
            winston.error('Removing unique constraint on program_start_channel_number failed with error message: ', err.message);
        });
    }
};
