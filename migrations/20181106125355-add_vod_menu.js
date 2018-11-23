'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('vod_menu', {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            name: {
                type: Sequelize.STRING(128),
                allowNull: false
            },
            description: {
                type: Sequelize.STRING(256),
                allowNull: false
            },
            pin_protected: {
                type: Sequelize.INTEGER(1),
                allowNull: false
            },
            isavailable: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }

        }).catch(function(err) {winston.error('Creating new table vod_menu failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('vod_menu')
            .catch(function(err) {winston.error('Deleting the table vod_menu failed with error message: ',err.message);});
    }

};
