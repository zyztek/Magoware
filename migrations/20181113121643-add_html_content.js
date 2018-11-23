'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('html_content', {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            name: {
                type: Sequelize.STRING(128),
                allowNull: false
            },
            description: {
                type: Sequelize.STRING(256),
                allowNull: false
            },
            content: {
                type: Sequelize.STRING(5000),
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        }).catch(function(err) {winston.error('Creating new table html_content failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('html_content')
            .catch(function(err) {winston.error('Deleting the table html_content failed with error message: ',err.message);});
    }

};
