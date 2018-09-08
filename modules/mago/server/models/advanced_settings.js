"use strict";

module.exports = function(sequelize, DataTypes) {
    var advancedSettings = sequelize.define('advanced_settings', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        parameter_id: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        parameter_value: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        parameter1_value: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        parameter2_value: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        duration: {
            type: DataTypes.INTEGER(50),
            allowNull: true
        }
    }, {
        tableName: 'advanced_settings',
        timestamps: false
    });
    return advancedSettings;
};