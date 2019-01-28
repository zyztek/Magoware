'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('users', 'password')
            .catch(function (err) {
                winston.error('Removing column users.password failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('users', 'password', {
                type: Sequelize.STRING,
                defaultValue: '',
                after: 'username'
            })
            .catch(function (err) {
                winston.error('Adding column users.password failed with error message: ', err.message);
            });
    }
};