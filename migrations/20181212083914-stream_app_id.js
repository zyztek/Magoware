'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {

        queryInterface.sequelize.query('UPDATE `channel_stream` AS `channel_stream` ' +
            'SET `channel_stream`.`stream_resolution` = REPLACE( REPLACE(`channel_stream`.`stream_resolution`, "small", "2,3"), "large", "1,4,5,6");')
            .then(function(success){
                winston.info('Success updating the values of column channel_stream.stream_resolution');
                //update default value for channel_stream.stream_resolution
                return queryInterface.changeColumn('channel_stream', 'stream_resolution', {type: Sequelize.STRING(30), allowNull: false, defaultValue: "1,2,3,4,5,6"}).then(function(success){
                    winston.info('Success updating the default value of channel_stream.stream_resolution to [1, 2, 3, 4, 5, 6]');
                }).catch(function(err) {winston.error('Changing channel_stream.stream_resolution default value failed with error message: ',err.message);});
        }).catch(function(error){
            winston.error('Updating the values of column channel_stream.stream_resolution failed with error message: ', err.message);
        });

    },

    down: function (queryInterface, Sequelize) {

        queryInterface.sequelize.query('UPDATE `channel_stream` AS `channel_stream` ' +
            'SET `channel_stream`.`stream_resolution` = REPLACE( REPLACE(`channel_stream`.`stream_resolution`, "2,3", "small"), "1,4,5,6", "large");').then(function(success){
            winston.info('Success updating the values of column channel_stream.stream_resolution');
            //update default value for channel_stream.stream_resolution
            return queryInterface.changeColumn('channel_stream', 'stream_resolution', {type: Sequelize.STRING(30), allowNull: false, defaultValue: "small,large"}).then(function(success){
                winston.info('Success reverting the default value of channel_stream.stream_resolution to [small, large]');
            }).catch(function(err) {winston.error('Changing channel_stream.stream_resolution default value failed with error message: ',err.message);});
        }).catch(function(error){
            winston.error('Updating the values of column channel_stream.stream_resolution failed with error message: ', err.message);
        });

    }
};