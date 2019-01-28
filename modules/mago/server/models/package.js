"use strict";

module.exports = function(sequelize, DataTypes) {
    var Package = sequelize.define('package', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        package_type_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        package_name: {
            type: DataTypes.STRING(128),
            allowNull: false
        }
    }, {
        tableName: 'package',
        associate: function(models) {
            Package.belongsTo(models.package_type, {foreignKey: 'package_type_id'});
            if(models.subscription) Package.hasMany(models.subscription, {foreignKey: 'package_id'});
            if(models.combo_packages) Package.hasMany(models.combo_packages, {foreignKey: 'package_id'});
            if(models.packages_channels) Package.hasMany(models.packages_channels, {foreignKey: 'package_id'});
            if(models.package_vod) Package.hasMany(models.package_vod, {foreignKey: 'package_id'});
            if(models.tv_series_packages)  Package.hasMany(models.tv_series_packages, {foreignKey: 'package_id'});
        }
    });
    return Package;
};
