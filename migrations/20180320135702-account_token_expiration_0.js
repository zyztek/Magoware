'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('login_data', 'resetPasswordExpires', {
                type: Sequelize.STRING(45),
                defaultValue: '0',
                allowNull: true
            })
            .catch(function (err) {
                winston.error('Changing login_data.resetPasswordExpires default value from space to 0 failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('login_data', 'resetPasswordExpires', {
                type: Sequelize.STRING(45),
                defaultValue: ' ',
                allowNull: true
            })
            .catch(function (err) {
                winston.error('Changing login_data.resetPasswordExpires default value from 0 to space failed with error message: ', err.message);
            });
    }
};
