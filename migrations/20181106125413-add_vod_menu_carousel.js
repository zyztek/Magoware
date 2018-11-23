'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('vod_menu_carousel', {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            vod_menu_id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                references: {model: 'vod_menu', key: 'id'}
            },
            name: {
                type: Sequelize.STRING(128),
                allowNull: false
            },
            description: {
                type: Sequelize.STRING(1000),
                allowNull: false
            },
            url: {
                type: Sequelize.STRING(255),
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
        }).catch(function(err) {winston.error('Creating new table vod_menu_carousel failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('vod_menu_carousel')
            .catch(function(err) {winston.error('Deleting the table vod_menu_carousel failed with error message: ',err.message);});
    }

};
