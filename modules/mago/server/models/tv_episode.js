"use strict";

module.exports = function(sequelize, DataTypes) {
    var tv_episode = sequelize.define('tv_episode', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        tv_season_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        season_number: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        episode_number: {
            type: DataTypes.INTEGER(11),
            allowNull: false
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
        original_language: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'en'
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
        cast: {
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
        default_subtitle_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        },
        expiration_time: {
            type: DataTypes.DATE,
            defaultValue: '3018:01:01 00:00:00'
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

        release_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: '1896-12-28'
        },
        status: {
            type: DataTypes.STRING(15),
            allowNull: false,
            defaultValue: 'released'
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'tv_episode',
        associate: function(models) {
            if(models.tv_season) tv_episode.belongsTo(models.tv_season, {foreignKey: 'tv_season_id'});
            if(models.tv_episode_subtitles) tv_episode.hasMany(models.tv_episode_subtitles, {foreignKey: 'tv_episode_id'});
            if(models.tv_episode_stream) tv_episode.hasMany(models.tv_episode_stream, {foreignKey: 'tv_episode_id'});
            if(models.tv_episode_resume) tv_episode.hasMany(models.tv_episode_resume, {foreignKey: 'tv_episode_id'});
        }
    });
    return tv_episode;
};