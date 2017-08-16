"use strict";

module.exports = function(sequelize, DataTypes) {
    var vodCategory = sequelize.define('vod_category', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(128),
            allowNull: true
        },
        pay: {
            type: DataTypes.STRING(50),
            defaultValue: 0,
            allowNull: true
        },
        password: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        sorting: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        icon_url: {
            type: DataTypes.STRING(256),
            allowNull: true
        },
        small_icon_url: {
            type: DataTypes.STRING(256),
            allowNull: true
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'vod_category',
        associate: function(models) {
            if (models.vod){
                vodCategory.hasMany(models.vod, {foreignKey: 'category_id'});
            }
        }
    });
    return vodCategory;
};
