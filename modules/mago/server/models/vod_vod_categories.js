"use strict";

module.exports = function(sequelize, DataTypes) {
    var vod_vod_categories = sequelize.define('vod_vod_categories', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        vod_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'vod_vod_category_unique'
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'vod_vod_category_unique'
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
        tableName: 'vod_vod_categories',
        associate: function(models) {
            vod_vod_categories.belongsTo(models.vod, {foreignKey: 'vod_id'});
            vod_vod_categories.belongsTo(models.vod_category, {foreignKey: 'category_id'})
        }
    });
    return vod_vod_categories;
};

