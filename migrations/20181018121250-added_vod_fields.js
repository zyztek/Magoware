'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod', 'original_title', {type: Sequelize.STRING(128), allowNull: false, defaultValue: '', after: 'title'})
            .catch(function (err) {winston.error('Adding column vod.original_title failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'tagline', {type: Sequelize.STRING, defaultValue: '', allowNull: false, after: 'description'})
            .catch(function (err) {winston.error('Adding column vod.tagline failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'homepage', {type: Sequelize.STRING, defaultValue: '', allowNull: false, after: 'description'})
            .catch(function (err) {winston.error('Adding column vod.homepage failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'vote_average', {type: Sequelize.DOUBLE, defaultValue: 5.0, allowNull: false, after: 'rate'})
            .catch(function (err) {winston.error('Adding column vod.vote_average failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'vote_count', {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false, after: 'rate'})
            .catch(function (err) {winston.error('Adding column vod.vote_count failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'popularity', {type: Sequelize.DOUBLE, defaultValue: 0, allowNull: false, after: 'rate'})
            .catch(function (err) {winston.error('Adding column vod.popularity failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'adult_content', {type: Sequelize.BOOLEAN, allowNull: false, after: 'pin_protected'})
            .catch(function (err) {winston.error('Adding column vod.adult_content failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'price', {type: Sequelize.DOUBLE, defaultValue: 1.0, allowNull: false})
            .catch(function (err) {winston.error('Adding column vod.price failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'budget', {type: Sequelize.INTEGER(11), allowNull: false})
            .catch(function (err) {winston.error('Adding column vod.budget failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'revenue', {type: Sequelize.INTEGER(11), allowNull: false})
            .catch(function (err) {winston.error('Adding column vod.revenue failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'original_language', {type: Sequelize.STRING(3), allowNull: false, defaultValue: 'en'})
            .catch(function (err) {winston.error('Adding column vod.original_language failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'release_date', {type: Sequelize.DATE, allowNull: false, defaultValue: '1896-12-28'})
            .catch(function (err) {winston.error('Adding column vod.release_date failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'status', {type: Sequelize.STRING(15), allowNull: false, defaultValue: 'released'})
            .catch(function (err) {winston.error('Adding column vod.status failed with error message: ', err.message);});
        return queryInterface.addColumn('vod', 'spoken_languages', {
            type: Sequelize.STRING, allowNull: false, defaultValue: '[]',
            get: function () {
                return JSON.parse(this.getDataValue('spoken_languages'));
            },
            set: function (value) {
                return this.setDataValue('spoken_languages', JSON.stringify(value));
            }
        }).catch(function (err) {winston.error('Adding column vod.status failed with error message: ', err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod', 'price')
            .catch(function (err) {winston.error('Removing column vod.price failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'vote_average')
            .catch(function (err) {winston.error('Removing column vod.vote_average failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'vote_count')
            .catch(function (err) {winston.error('Removing column vod.vote_count failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'popularity')
            .catch(function (err) {winston.error('Removing column vod.popularity failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'adult_content')
            .catch(function (err) {winston.error('Removing column vod.adult_content failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'budget')
            .catch(function (err) {winston.error('Removing column vod.budget failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'revenue')
            .catch(function (err) {winston.error('Removing column vod.revenue failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'original_language')
            .catch(function (err) {winston.error('Removing column vod.original_language failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'original_title')
            .catch(function (err) {winston.error('Removing column vod.original_title failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'release_date')
            .catch(function (err) {winston.error('Removing column vod.release_date failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'status')
            .catch(function (err) {winston.error('Removing column vod.status failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'tagline')
            .catch(function (err) {winston.error('Removing column vod.tagline failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'homepage')
            .catch(function (err) {winston.error('Removing column vod.homepage failed with error message: ', err.message);});
        return queryInterface.removeColumn('vod', 'spoken_languages')
            .catch(function (err) {winston.error('Removing column vod.spoken_languages failed with error message: ', err.message);});
    }
};


