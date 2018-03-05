'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('settings', 'akamai_token_key',{type: Sequelize.STRING(255), defaultValue: 'akamai_token_key', allowNull: false})
            .catch(function(err) {console.log('Adding column settings.akamai_token_key failed with error message: ',err.message);});
        queryInterface.addColumn('settings', 'flussonic_token_key',{type: Sequelize.STRING(255), defaultValue: 'flussonic_token_key', allowNull: false})
            .catch(function(err) {console.log('Adding column settings.flussonic_token_key failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('settings', 'akamai_token_key')
            .catch(function(err) {console.log('Removing column settings.akamai_token_key failed with error message: ',err.message);});
        queryInterface.removeColumn('settings', 'flussonic_token_key')
            .catch(function(err) {console.log('Removing column settings.flussonic_token_key failed with error message: ',err.message);});
    }
};