'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('device_menu', 'menu_description',{type: Sequelize.STRING(256), allowNull: false})
            .catch(function(err) {console.log('Adding column device_menu.menu_description failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('device_menu', 'menu_description')
            .catch(function(err) {console.log('Removing column device_menu.menu_description failed with error message: ',err.message);});
    }
};