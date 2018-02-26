"use strict";

module.exports = function(sequelize, DataTypes) {
    var paymentTransactions = sequelize.define('payment_transactions', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },

        transaction_id: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true
        },

        transaction_type: {
            type: DataTypes.STRING(32),
            allowNull: false
        },

        transaction_token: {
            type: DataTypes.STRING(128),
            allowNull: false,
            //unique: true
        },

        refunds_info: {
            type: DataTypes.STRING(128),
            allowNull: false
        },

        message: {
            type: DataTypes.STRING(128),
            allowNull: false
        },

        payment_provider: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        payment_success: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        customer_username: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        product_id: {
            type: DataTypes.STRING(32),
            allowNull: true
        },
        amount: {
            type: DataTypes.BIGINT,
            allowNull: false
        },

        date: {
            type: DataTypes.DATE,
            allowNull: false
        },

        full_log: {
            type: DataTypes.TEXT,
            allowNull: true
        }

    }, {
        tableName: 'payment_transactions',
        associate: function(models) {

        }
    });
    return paymentTransactions;
};