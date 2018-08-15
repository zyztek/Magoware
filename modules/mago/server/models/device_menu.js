"use strict";

module.exports = function(sequelize, DataTypes) {
    var deviceMenu = sequelize.define('device_menu', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        title: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        icon_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        appid: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        menu_code: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        position: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: true
        },
        locale: {
            type: DataTypes.STRING(16),
            allowNull: false,
            defaultValue: 'en'
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'device_menu',
        associate: function(models) {
        }
    });
    return deviceMenu;
};
