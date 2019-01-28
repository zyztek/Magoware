'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod_stream', 'drm_platform', {type: Sequelize.STRING(20), allowNull: false})
            .catch(function(err) {winston.error('Adding column vod_stream.drm_platform failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod_stream', 'drm_platform')
            .catch(function(err) {winston.error('Removing column vod_stream.drm_platform failed with error message: ',err.message);});
    }
};