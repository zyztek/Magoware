'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('vod', 'expiration_time', {
            //change default value of vod.expiration_time
            type: Sequelize.DATE,
            defaultValue: '3018:01:01 00:00:00'
        }).then(function (success) {
            //drop column vod.year
            return queryInterface.removeColumn('vod', 'year').catch(function (err) {
                winston.error('Removing column vod.year failed with error message: ', err.message);
            });
        }).catch(function (err) {
            winston.error('Changing vod.expiration_date default value failed with error message: ', err.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        //revert default value of vod.expiration_time
        return queryInterface.changeColumn('vod', 'expiration_time', {
            type: Sequelize.DATE,
            defaultValue: '2019:01:01 00:00:00'
        }).then(function (success) {
            //revert deleting column vod.year
            return queryInterface.addColumn('vod', 'year', {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                defaultValue: 1896
            }).catch(function (err) {
                winston.error('Adding column vod.year failed with error message: ', err.message);
            });
        }).catch(function (err) {
            winston.error('Changing vod.expiration_date default value failed with error message: ', err.message);
        });
    }
};