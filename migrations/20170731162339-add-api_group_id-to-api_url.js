'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
        'api_url',
        'api_group_id',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
    ).catch(function(err) {
        console.log('Migration failed with error message: ',err.message);
    });
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
