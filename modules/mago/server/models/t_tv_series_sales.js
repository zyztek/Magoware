"use strict";

module.exports = function(sequelize, DataTypes) {
    var t_tv_series_sales = sequelize.define('t_tv_series_sales', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        tv_show_id: {
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
        tableName: 't_tv_series_sales',
        associate: function(models) {
            t_tv_series_sales.belongsTo(models.tv_series, {foreignKey: 'tv_show_id'});
            t_tv_series_sales.belongsTo(models.login_data, {foreignKey: 'login_data_id'});
        }
    });
    return t_tv_series_sales;
};