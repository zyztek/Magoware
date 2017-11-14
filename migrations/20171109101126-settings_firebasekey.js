'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('settings', 'firebase_key',{type: Sequelize.STRING(255), defaultValue: '', allowNull: false})
            .catch(function(err) {console.log('Adding column settings.firebase_key failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('settings', 'firebase_key')
            .catch(function(err) {console.log('Removing column settings.firebase_key failed with error message: ',err.message);});
    }
};