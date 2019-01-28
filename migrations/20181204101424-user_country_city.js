'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('users', 'country', {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: 'other',
            after: 'address'
        }).then(function (success) {
            return queryInterface.addColumn('users', 'city', {
                type: Sequelize.STRING(100),
                allowNull: true,
                defaultValue: 'other',
                after: 'address'
            }).catch(function (err) {
                winston.error('Adding column users.city failed with error message: ', err.message);
            });
        }).catch(function (err) {
            winston.error('Adding column users.country failed with error message: ', err);
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('users', 'country').then(function (success) {
            return queryInterface.removeColumn('users', 'city').catch(function (err) {
                winston.error('Dropping column users.city failed with error message: ', err.message);
            });
        }).catch(function (err) {
            winston.error('Dropping column users.country failed with error message: ', err.message);
        });
    }
};