"use strict";

module.exports = function(sequelize, DataTypes) {
    var deviceMenuLevel2 = sequelize.define('device_menu_level2', {
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

        menu_level: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        parent_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        menu_description: {
            type: DataTypes.STRING(256),
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
        tableName: 'device_menu_level2',
        associate: function(models) {
        }
    });
    return deviceMenuLevel2;
};
