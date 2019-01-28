"use strict";

module.exports = function(sequelize, DataTypes) {
    var tv_series_categories = sequelize.define('tv_series_categories', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tv_show_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'categories_tv_series'
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'categories_tv_series'
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'tv_series_categories',
        associate: function(models) {
            tv_series_categories.belongsTo(models.vod_category, {foreignKey: 'category_id'});
            tv_series_categories.belongsTo(models.tv_series, {foreignKey: 'tv_show_id'});
        }
    });
    return tv_series_categories;
};
