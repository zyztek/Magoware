'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('users', 'last_login_ip', {type: Sequelize.STRING(45), allowNull: true})
            .catch(function(err) {winston.error('Adding column users.last_login_ip failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('users', 'last_login_ip')
            .catch(function(err) {winston.error('Removing column users.last_login_ip failed with error message: ',err.message);});
    }
};