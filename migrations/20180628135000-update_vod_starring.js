'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('vod', 'starring', {type: Sequelize.STRING(1000), allowNull: false})
            .catch(function(err) {winston.error('Changing vod.starring length to 1000 characters failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('vod', 'starring', {type: Sequelize.STRING(255), allowNull: false})
            .catch(function(err) {winston.error('Changing vod.starring length to 255 characters failed with error message: ',err.message);});
    }
};