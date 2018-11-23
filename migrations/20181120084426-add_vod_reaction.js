'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod_resume', 'reaction', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            after: 'resume_position'
        }).catch(function (err) {
            winston.error('Adding column vod_resume.reaction failed with error message: ', err.message);
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod_resume', 'reaction').catch(function (err) {
            winston.error('Dropping column vod_resume.reaction failed with error message: ', err.message);
        });
    }
};