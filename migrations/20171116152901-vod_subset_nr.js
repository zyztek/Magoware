'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('settings', 'vod_subset_nr', {
                type: Sequelize.INTEGER(11),
                defaultValue: 200,
                allowNull: false
            })
            .catch(function (err) {
                winston.error('Adding column settings.vod_subset_nr failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('settings', 'vod_subset_nr')
            .catch(function (err) {
                winston.error('Removing column settings.vod_subset_nr failed with error message: ', err.message);
            });
    }
};