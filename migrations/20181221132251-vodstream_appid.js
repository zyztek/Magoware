'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        //create vod.stream_resolution
        return queryInterface.addColumn('vod_stream', 'stream_resolution', {type: Sequelize.STRING(30), allowNull: false, defaultValue: "1,2,3,4,5,6", after: 'url'})
            .then(function(success){
                winston.info('Success adding column vod_stream.stream_resolution');
            }).catch(function(err) {winston.error('Adding vod_stream.stream_resolution failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        //delete vod.stream_resolution
        return queryInterface.removeColumn('vod_stream', 'stream_resolution').then(function(success){
            winston.info('Success deleting column vod_stream.stream_resolution');
        }).catch(function(err) {winston.error('Deleting vod_stream.stream_resolution failed with error message: ',err.message);});
    }
};