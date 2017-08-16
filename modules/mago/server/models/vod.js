"use strict";

module.exports = function(sequelize, DataTypes) {
    var Vod = sequelize.define('vod', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        package_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        year: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        icon_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        clicks: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        rate: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        director: {
            type: DataTypes.STRING(128),
            allowNull: true
        },
        starring: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        pin_protected: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'vod',
        associate: function(models) {
            Vod.belongsTo(models.package, {foreignKey: 'package_id'});
            Vod.belongsTo(models.vod_category, {foreignKey: 'category_id'});
            if(models.vod_subtitles){
                Vod.hasMany(models.vod_subtitles, {foreignKey: 'vod_id'});
            }
            if(models.vod_stream){
                Vod.hasMany(models.vod_stream, {foreignKey: 'vod_id'});
            }
        }
    });
    return Vod;
};
