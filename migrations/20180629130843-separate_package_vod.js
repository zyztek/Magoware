'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod', 'package_id')
            .catch(function (err) {
                winston.error('Removing column package_vod.package_id failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod', 'package_id', {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                after: 'title',
                defaultValue: 1
            })
            .catch(function (err) {
                winston.error('Adding column vod.package_id failed with error message: ', err.message);
            });
    }
};