'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.changeColumn('vod', 'starring',{type: Sequelize.STRING(1000), allowNull: false})
            .catch(function(err) {console.log('Changing vod.starring length to 1000 characters failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.changeColumn('vod', 'starring',{type: Sequelize.STRING(255), allowNull: false})
            .catch(function(err) {console.log('Changing vod.starring length to 255 characters failed with error message: ',err.message);});
    }
};