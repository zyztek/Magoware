'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('t_vod_sales', {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            vod_id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                references: {model: 'vod', key: 'id'}
            },
            login_data_id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                references: {model: 'login_data', key: 'id'}
            },
            start_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        }).catch(function (err) {
            winston.error('Creating new table t_vod_sales failed with error message: ', err.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('t_vod_sales')
            .catch(function (err) {
                winston.error('Deleting the table t_vod_sales failed with error message: ', err.message);
            });
    }
};