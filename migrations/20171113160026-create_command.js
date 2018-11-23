'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            'commands',
            {
                id: {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                login_data_id: {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    references: {
                        model: 'login_data',
                        key: 'id'
                    }
                },
                googleappid: {
                    type: Sequelize.STRING(255),
                    defaultValue: '',
                    allowNull: false
                },
                command: {
                    type: Sequelize.STRING(45),
                    defaultValue: '',
                    allowNull: false
                },
                status: {
                    type: Sequelize.STRING(10),
                    defaultValue: 'sent',
                    allowNull: false
                },
                createdAt: {
                    type: Sequelize.DATE
                },
                updatedAt: {
                    type: Sequelize.DATE
                }
            }).catch(function(err) {winston.error('Creating table commands failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable ('commands')
            .catch(function(err) {winston.error('Deleting table commands failed with error message: ',err.message);});
    }
};