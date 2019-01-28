'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod', 'default_subtitle_id', {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                defaultValue: 0
            })
            .catch(function (err) {
                winston.error('Adding column vod.default_subtitle_id failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod', 'default_subtitle_id')
            .catch(function (err) {
                winston.error('Removing column vod.default_subtitle_id failed with error message: ', err.message);
            });
    }
};