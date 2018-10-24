'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('device_menu', 'parent_id',{type: Sequelize.INTEGER(11), allowNull: false})
            .catch(function(err) {console.log('Adding column device_menu.parent_id failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('device_menu', 'parent_id')
            .catch(function(err) {console.log('Removing column device_menu.parent_id failed with error message: ',err.message);});
    }
};