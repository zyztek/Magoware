'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('device_menu', 'parent_id', {type: Sequelize.INTEGER(11), allowNull: false})
            .catch(function(err) {winston.error('Adding column device_menu.parent_id failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('device_menu', 'parent_id')
            .catch(function(err) {winston.error('Removing column device_menu.parent_id failed with error message: ',err.message);});
    }
};