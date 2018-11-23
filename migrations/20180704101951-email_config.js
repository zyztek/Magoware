'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('settings', 'smtp_host',{type: Sequelize.STRING, allowNull: false, defaultValue: 'smtp.gmail.com:465', after: 'email_password'})
            .catch(function(err) {winston.error('Adding column settings.smtp_host failed with error message: ',err.message);});
        return queryInterface.addColumn('settings', 'smtp_secure',{type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, after: 'email_password'})
            .catch(function(err) {winston.error('Adding column settings.smtp_secure failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('settings', 'smtp_host')
            .catch(function(err) {winston.error('Dropping column settings.smtp_host failed with error message: ',err.message);});
        return queryInterface.removeColumn('settings', 'smtp_secure')
            .catch(function(err) {winston.error('Dropping column settings.smtp_secure failed with error message: ',err.message);});
    }
};
