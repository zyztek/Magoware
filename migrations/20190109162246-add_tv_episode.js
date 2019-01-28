'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('tv_episode', {
            id: {type: Sequelize.INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, unique: true},
            tv_season_id: {type: Sequelize.INTEGER(11), allowNull: true, references: {model: 'tv_season', key: 'id'}},
            season_number: {type: Sequelize.INTEGER(11), allowNull: false},
            episode_number: {type: Sequelize.INTEGER(11), allowNull: false},
            imdb_id: {type: Sequelize.STRING(25), allowNull: true},
            title: {type: Sequelize.STRING(128), allowNull: false},
            original_title: {type: Sequelize.STRING(128), allowNull: false, defaultValue: ''},
            description: {type: Sequelize.STRING(1000), allowNull: false},
            tagline: {type: Sequelize.STRING, allowNull: false, defaultValue: ''},
            homepage: {type: Sequelize.STRING, allowNull: false, defaultValue: ''},
            original_language: {type: Sequelize.STRING(3), allowNull: false, defaultValue: 'en'},
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
            pin_protected: {type: Sequelize.INTEGER(1), allowNull: false},
            adult_content: {type: Sequelize.BOOLEAN, allowNull: false},
            default_subtitle_id: {type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0},
            expiration_time: {type: Sequelize.DATE, defaultValue: '3018:01:01 00:00:00'},
            price: {type: Sequelize.DOUBLE, defaultValue: 1.0, allowNull: false},
            mandatory_ads: {type: Sequelize.BOOLEAN, allowNull: false},
            revenue: {type: Sequelize.INTEGER(11), allowNull: false},
            budget: {type: Sequelize.INTEGER(11), allowNull: false},
            release_date: {type: Sequelize.DATE, allowNull: false, defaultValue: '1896-12-28'},
            status: {type: Sequelize.STRING(15), allowNull: false, defaultValue: 'released'},
            is_available: {type: Sequelize.BOOLEAN, allowNull: false},
            createdAt: {type: Sequelize.DATE},
            updatedAt: {type: Sequelize.DATE}
        }).catch(function(err) {winston.error('Creating new table tv_episode failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('tv_episode')
            .catch(function(err) {winston.error('Deleting the table tv_episode failed with error message: ',err.message);});
    }
};