'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        //create vod.stream_resolution
        return queryInterface.addColumn('t_vod_sales', 'transaction_id', {type: Sequelize.STRING(128), allowNull: true, defaultValue: "", after: 'end_time'})
            .then(function(success){
                winston.info('Success adding column vod_stream.transaction_id');
            }).catch(function(err) {winston.error('Adding t_vod_sales.transaction_id failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        //delete vod.stream_resolution
        return queryInterface.removeColumn('t_vod_sales', 'transaction_id').then(function(success){
            winston.info('Success deleting column vod_stream.transaction_id');
        }).catch(function(err) {winston.error('Deleting t_vod_sales.transaction_id failed with error message: ',err.message);});
    }
};