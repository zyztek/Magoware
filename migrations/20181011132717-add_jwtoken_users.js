'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('users', 'jwtoken',{type: Sequelize.STRING(255), allowNull: false, defaultValue: ''})
            .catch(function(err) {console.log('Adding column users.jwtoken failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('users', 'jwtoken')
            .catch(function(err) {console.log('Removing column users.jwtoken failed with error message: ',err.message);});
    }
};