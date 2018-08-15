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
        vod_parent_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        vod_type: {
            type: DataTypes.STRING(20),
            defaultValue: "film",
            allowNull: false
        },
        season_number: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        imdb_id: {
            type: DataTypes.STRING(25),
            allowNull: true
        },
        title: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(1000),
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
            type: DataTypes.INTEGER,
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
            type: DataTypes.STRING(1000),
            allowNull: true
        },
        trailer_url: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: ''
        },
        vod_preview_url: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: ''
        },
        pin_protected: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        default_subtitle_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        },
        expiration_time: {
            type: DataTypes.DATE,
            defaultValue: '2019:01:01 00:00:00'
        }
    }, {
        tableName: 'vod',
        associate: function(models) {
            Vod.hasMany(models.package_vod, {foreignKey: 'vod_id'});
            if(models.vod_vod_categories) Vod.hasMany(models.vod_vod_categories, {foreignKey: 'vod_id'});
            if(models.vod_vod_categories) Vod.hasMany(models.vod_vod_categories, {as: 'vod_vod_category', foreignKey: 'vod_id'}); //this association serves to perform a double join on a matching category
            if(models.vod_subtitles){
                Vod.hasMany(models.vod_subtitles, {foreignKey: 'vod_id'});
            }
            if(models.vod_stream){
                Vod.hasMany(models.vod_stream, {foreignKey: 'vod_id'});
            }
            Vod.hasMany(models.vod, { as: 'seasons', foreignKey: 'vod_parent_id', useJunctionTable: false })
            Vod.hasMany(models.vod, { as: 'episodes', foreignKey: 'vod_parent_id', useJunctionTable: false })
        }
    });
    return Vod;
};

