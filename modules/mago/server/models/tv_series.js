"use strict";

module.exports = function(sequelize, DataTypes) {
    var tv_series = sequelize.define('tv_series', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
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
        }, //todo: do we need this?
        rate: {
            type: DataTypes.INTEGER,
            allowNull: false
        }, //todo: do we need this?
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
        episode_runtime: {
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
        production_company: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        origin_country: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        release_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: '1896-12-28'
        },
        pin_protected: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        adult_content: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        price: {
            type: DataTypes.DOUBLE,
            defaultValue: 1.0,
            allowNull: false
        },
        mandatory_ads: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }, //todo: do we need this?
        revenue: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        }, //todo: do we need this?
        budget: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        }, //todo: do we need this?
        status: {
            type: DataTypes.STRING(15),
            allowNull: false,
            defaultValue: 'ongoing'
        },
        expiration_time: {
            type: DataTypes.DATE,
            defaultValue: '3018:01:01 00:00:00'
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'tv_series',
        associate: function(models) {
            if(models.tv_series_packages) tv_series.hasMany(models.tv_series_packages, {foreignKey: 'tv_show_id'});
            if(models.tv_series_categories) tv_series.hasMany(models.tv_series_categories, {foreignKey: 'tv_show_id'});
            if(models.tv_season) tv_series.hasMany(models.tv_season, {foreignKey: 'tv_show_id'});
            if(models.tv_season) tv_series.hasMany(models.tv_season, {as:'season', foreignKey: 'tv_show_id'});
            if(models.t_tv_series_sales) tv_series.hasMany(models.t_tv_series_sales, {foreignKey: 'tv_show_id'})
        }
    });
    return tv_series;
};