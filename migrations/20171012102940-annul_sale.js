'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('salesreport', 'active',{type: Sequelize.BOOLEAN, defaultValue: 1, allowNull: false})
            .catch(function(err) {console.log('Adding column salesreport.active failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('salesreport', 'active')
            .catch(function(err) {console.log('Removing column salesreport.active failed with error message: ',err.message);});
    }
};