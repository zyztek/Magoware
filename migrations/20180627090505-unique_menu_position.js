'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('device_menu', 'position', {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                unique: true
            })
            .catch(function (err) {
                winston.error('Adding unique index to device_menu.position failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('device_menu', 'position', {type: Sequelize.INTEGER(11), allowNull: false})
            .catch(function (err) {
                winston.error('Dropping unique index to device_menu.position failed with error message: ', err.message);
            });
    }
};