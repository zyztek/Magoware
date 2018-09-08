'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.createTable('advanced_settings', {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            parameter_id: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            parameter_value: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            parameter1_value: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            parameter2_value: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            duration: {
                type: Sequelize.INTEGER(50),
                allowNull: false
            }
        }).catch(function(err) {console.log('Creating new table advanced_settings failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.dropTable('advanced_settings')
            .catch(function(err) {console.log('Deleting the table advanced_settings failed with error message: ',err.message);});
    }

};