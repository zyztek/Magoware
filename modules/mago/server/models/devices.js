"use strict";

module.exports = function(sequelize, DataTypes) {
    var Devices = sequelize.define('devices', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        login_data_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        googleappid: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        device_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        device_id: {
            type: DataTypes.STRING(40),
            allowNull: false,
            unique: true
        },
        device_ip: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        device_mac_address: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        device_wifimac_address: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        ntype: {
            type: DataTypes.STRING(2),
            allowNull: false,
            defaultValue: '1'
        },
        appid: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        app_name: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        app_version: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        device_brand: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        os: {
            type: DataTypes.STRING,
            allowNull: true
        },
        screen_resolution: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        hdmi: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: false
        },
        api_version: {
            type: DataTypes.STRING(16),
            allowNull: true
        },
        firmware: {
            type: DataTypes.STRING(128),
            allowNull: true
        },
        language: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'devices',
        associate: function(models) {
            Devices.belongsTo(models.login_data, {foreignKey: 'login_data_id'});
        }
    });
    return Devices;
};