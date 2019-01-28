'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('payment_transactions', {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            transaction_id: {
                type: Sequelize.STRING(128),
                allowNull: false,
                unique: true
            },
            refunds_info: {
                type: Sequelize.STRING(15),
                allowNull: false
            },
            payment_provider: {
                type: Sequelize.STRING(15),
                allowNull: false
            },
            payment_status: {
                type: Sequelize.STRING(15),
                allowNull: false
            },
            customer_username: {
                type: Sequelize.STRING(15),
                allowNull: false
            },
            combo_id: {
                type: Sequelize.INTEGER(11),
                allowNull: false
            },
            amount: {
                type: Sequelize.BIGINT,
                allowNull: false
            },
            date: {
                type: Sequelize.DATE,
                allowNull: false
            }
        }).catch(function (err) {
            winston.error('Creation of table package_vod failed with error message: ', err.message);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.deleteTable('payment_transactions')
            .catch(function (err) {
                winston.error('Deleting the table payment_transactions failed with error message: ', err.message);
            });
    }
};