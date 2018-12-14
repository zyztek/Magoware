'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('html_content', 'url', {type: Sequelize.STRING(255), allowNull: true})
            .catch(function(err) {winston.error('Adding column html_content.url failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('html_content', 'url')
            .catch(function(err) {winston.error('Removing column html_content.url failed with error message: ',err.message);});
    }
};