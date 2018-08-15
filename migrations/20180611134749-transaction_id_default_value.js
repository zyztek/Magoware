'use strict';

module.exports = {

  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('salesreport', 'transaction_id',{type: Sequelize.STRING(128), allowNull: true, defaultValue: ''})
        .catch(function(err) {console.log('Adding default value to column salesreport.transaction_id failed with error message: ',err.message);});

  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('salesreport', 'transaction_id',{type: Sequelize.STRING(128), allowNull: false})
        .catch(function(err) {console.log('Reverting default value to column salesreport.transaction_id failed with error message: ',err.message);});

  }

};