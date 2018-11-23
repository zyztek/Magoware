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
        original_title: {
            type: DataTypes.STRING(128),
            allowNull: false,
            defaultValue: ''
        },
        description: {
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        tagline: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        homepage: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        spoken_languages: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '[]',
            get: function () {
                if(this.getDataValue('spoken_languages')) return JSON.parse(this.getDataValue('spoken_languages'));
            },
            set: function (value) {
                return this.setDataValue('spoken_languages', JSON.stringify(value));
            }
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
        vote_average: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 5.0
        },
        vote_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        popularity: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
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
        adult_content: {
            type: DataTypes.BOOLEAN,
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
        },
        price: {
            type: DataTypes.DOUBLE,
            defaultValue: 1.0,
            allowNull: false
        },
        mandatory_ads: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        revenue: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        budget: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        original_language: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'en'
        },
        release_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: '1896-12-28'
        },
        status: {
            type: DataTypes.STRING(15),
            allowNull: false,
            defaultValue: 'released'
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
            if(models.t_vod_sales) Vod.hasMany(models.t_vod_sales, {foreignKey: 'vod_id'});
            Vod.belongsTo(models.vod, { as: 'tv_show_filter', foreignKey: 'vod_parent_id', useJunctionTable: false })
            Vod.belongsTo(models.vod, { as: 'season_filter', foreignKey: 'vod_parent_id', useJunctionTable: false })
            Vod.hasMany(models.vod, { as: 'seasons', foreignKey: 'vod_parent_id', useJunctionTable: false })
            Vod.hasMany(models.vod, { as: 'episodes', foreignKey: 'vod_parent_id', useJunctionTable: false })
            if (models.vod_resume) Vod.hasMany(models.vod_resume, {foreignKey: 'vod_id'});
        }
    });
    return Vod;
};

