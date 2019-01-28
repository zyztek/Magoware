'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('vod', 'description', {type: Sequelize.STRING(280), allowNull: false})
            .catch(function (err) {
                winston.error('Changing vod.description length to 280 characters failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('vod', 'description', {type: Sequelize.STRING(255), allowNull: false})
            .catch(function (err) {
                winston.error('Changing vod.rate description length to 255 characters failed with error message: ', err.message);
            });
    }
};
