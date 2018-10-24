'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('device_menu', 'is_guest_menu', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                after: 'locale'
            })
            .catch(function (err) {
                console.log('Adding column device_menu.is_guest_menu failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('device_menu', 'is_guest_menu')
            .catch(function (err) {
                console.log('Removing column device_menu.is_guest_menu failed with error message: ', err.message);
            });
    }
};