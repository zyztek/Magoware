'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('settings', 'allow_guest_login', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                after: 'key_transition'
            })
            .catch(function (err) {
                console.log('Adding column settings.allow_guest_login failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('settings', 'allow_guest_login')
            .catch(function (err) {
                console.log('Removing column settings.allow_guest_login failed with error message: ', err.message);
            });
    }
};