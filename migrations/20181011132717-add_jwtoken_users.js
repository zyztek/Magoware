'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('users', 'jwtoken', {
                type: Sequelize.STRING(255),
                allowNull: false,
                defaultValue: ''
            })
            .catch(function(err) {winston.error('Adding column users.jwtoken failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('users', 'jwtoken')
            .catch(function(err) {winston.error('Removing column users.jwtoken failed with error message: ',err.message);});
    }
};