'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('login_data', 'comment', {type: Sequelize.STRING(255), allowNull: true})
            .catch(function(err) {winston.error('Adding column login_data.comment failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('login_data', 'comment')
            .catch(function(err) {winston.error('Removing column login_data.comment failed with error message: ',err.message);});
    }
};