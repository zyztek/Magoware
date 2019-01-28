'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('tv_season', {
            id: {type: Sequelize.INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, unique: true},
            tv_show_id: {type: Sequelize.INTEGER(11), allowNull: true,  references: {model: 'tv_series', key: 'id'}},
            season_number: {type: Sequelize.INTEGER(11), allowNull: true},
            imdb_id: {type: Sequelize.STRING(25), allowNull: true},
            title: {type: Sequelize.STRING(128), allowNull: false},
            original_title: {type: Sequelize.STRING(128), allowNull: false, defaultValue: ''},
            description: {type: Sequelize.STRING(1000), allowNull: false},
            tagline: {type: Sequelize.STRING, allowNull: false, defaultValue: ''},
            homepage: {type: Sequelize.STRING, allowNull: false, defaultValue: ''},
            spoken_languages: {type: Sequelize.STRING, allowNull: false, defaultValue: '[]',
                get: function () {if(this.getDataValue('spoken_languages')) return JSON.parse(this.getDataValue('spoken_languages'));},
                set: function (value) {return this.setDataValue('spoken_languages', JSON.stringify(value));}
            },
            icon_url: {type: Sequelize.STRING(255), allowNull: false},
            image_url: {type: Sequelize.STRING(255), allowNull: true},
            clicks: {type: Sequelize.INTEGER(11), allowNull: false},
            rate: {type: Sequelize.INTEGER, allowNull: false},
            vote_average: {type: Sequelize.DOUBLE, allowNull: false, defaultValue: 5.0},
            vote_count: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
            popularity: {type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0},
            duration: {type: Sequelize.INTEGER(11), allowNull: true},
            director: {type: Sequelize.STRING(128), allowNull: true},
            cast: {type: Sequelize.STRING(1000), allowNull: true},
            trailer_url: {type: Sequelize.STRING(255), allowNull: false, defaultValue: ''},
            vod_preview_url: {type: Sequelize.STRING(255), allowNull: false, defaultValue: ''},
            expiration_time: {type: Sequelize.DATE, defaultValue: '3018:01:01 00:00:00'},
            price: {type: Sequelize.DOUBLE, defaultValue: 1.0, allowNull: false},
            mandatory_ads: {type: Sequelize.BOOLEAN, allowNull: false},
            revenue: {type: Sequelize.INTEGER(11), allowNull: false},
            budget: {type: Sequelize.INTEGER(11), allowNull: false},
            original_language: {type: Sequelize.STRING(3), allowNull: false, defaultValue: 'en'},
            status: {type: Sequelize.STRING(15), allowNull: false, defaultValue: 'ongoing'},
            is_available: {type: Sequelize.BOOLEAN, allowNull: false},
            createdAt: {type: Sequelize.DATE},
            updatedAt: {type: Sequelize.DATE}
        }).catch(function(err) {winston.error('Creating new table tv_season failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('tv_season')
            .catch(function(err) {winston.error('Deleting the table tv_season failed with error message: ',err.message);});
    }
};