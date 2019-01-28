"use strict";

module.exports = function(sequelize, DataTypes) {
    var t_vod_sales = sequelize.define('t_vod_sales', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        vod_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        login_data_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        transaction_id: {
            type: DataTypes.STRING(128),
            allowNull: true,
            defaultValue: ''
        }
    }, {
        tableName: 't_vod_sales',
        associate: function(models) {
            t_vod_sales.belongsTo(models.vod, {foreignKey: 'vod_id'});
            t_vod_sales.belongsTo(models.login_data, {foreignKey: 'login_data_id'});
        }
    });
    return t_vod_sales;
};
