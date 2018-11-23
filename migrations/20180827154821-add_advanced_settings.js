'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('advanced_settings', {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            parameter_id: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            parameter_value: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            parameter1_value: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            parameter2_value: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            duration: {
                type: Sequelize.INTEGER(50),
                allowNull: false
            }
        }).catch(function(err) {winston.error('Creating new table advanced_settings failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('advanced_settings')
            .catch(function(err) {winston.error('Deleting the table advanced_settings failed with error message: ',err.message);});
    }

};
