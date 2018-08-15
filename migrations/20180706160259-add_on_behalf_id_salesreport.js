'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('salesreport', 'on_behalf_id',{type: Sequelize.INTEGER(11), allowNull: true})
            .catch(function(err) {console.log('Adding column salesreport.on_behalf_id failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('salesreport', 'on_behalf_id')
            .catch(function(err) {console.log('Removing column salesreport.on_behalf_id failed with error message: ',err.message);});
    }
};