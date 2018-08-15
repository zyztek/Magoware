'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('settings', 'smtp_host',{type: Sequelize.STRING, allowNull: false, defaultValue: 'smtp.gmail.com:465', after: 'email_password'})
            .catch(function(err) {console.log('Adding column settings.smtp_host failed with error message: ',err.message);});
        queryInterface.addColumn('settings', 'smtp_secure',{type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, after: 'email_password'})
            .catch(function(err) {console.log('Adding column settings.smtp_secure failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('settings', 'smtp_host')
            .catch(function(err) {console.log('Dropping column settings.smtp_host failed with error message: ',err.message);});
        queryInterface.removeColumn('settings', 'smtp_secure')
            .catch(function(err) {console.log('Dropping column settings.smtp_secure failed with error message: ',err.message);});
    }
};
