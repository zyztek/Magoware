"use strict";

module.exports = function(sequelize, DataTypes) {
    var tv_series_packages = sequelize.define('tv_series_packages', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tv_show_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'package_tv_series'
        },
        package_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'package_tv_series'
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'tv_series_packages',
        associate: function(models) {
            tv_series_packages.belongsTo(models.package, {foreignKey: 'package_id'});
            tv_series_packages.belongsTo(models.tv_series, {foreignKey: 'tv_show_id'});
        }
    });
    return tv_series_packages;
};
