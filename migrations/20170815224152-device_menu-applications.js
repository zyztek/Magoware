'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {

        queryInterface.addColumn(
            'device_menu',
            'applications',
            {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: '1,2,3,4,5'
            }
        ).then(function () {
            queryInterface.sequelize.query('delete from device_menu where appid > 1;');
        }).catch(function(err) {
            console.log('Migration failed with error message: ',err.message);
        });


        /*
         Add altering commands here.
         Return a promise to correctly handle asynchronicity.

         Example:
         return queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
    },

    down: function (queryInterface, Sequelize) {
        /*
         Add reverting commands here.
         Return a promise to correctly handle asynchronicity.

         Example:
         return queryInterface.dropTable('users');
         */
    }
};
