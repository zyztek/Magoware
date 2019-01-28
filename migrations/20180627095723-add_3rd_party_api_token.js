'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('users', 'third_party_api_token', {
                type: Sequelize.STRING(255),
                allowNull: false,
                defaultValue: '',
                after: 'address'
            })
            .catch(function (err) {
                winston.error('Adding column users.third_party_api_token failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('users', 'third_party_api_token', {type: Sequelize.INTEGER(255)})
            .catch(function (err) {
                winston.error('Dropping column users.third_party_api_token failed with error message: ', err.message);
            });
    }
};