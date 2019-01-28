'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod', 'expiration_time', {
                type: Sequelize.DATE,
                defaultValue: '2019:01:01 00:00:00',
                after: 'default_subtitle_id'
            })
            .catch(function (err) {
                winston.error('Adding column vod.expiration_time failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod', 'expiration_time')
            .catch(function (err) {
                winston.error('Dropping column vod.expiration_time failed with error message: ', err.message);
            });
    }
};