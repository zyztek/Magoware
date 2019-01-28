'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod', 'imdb_id', {type: Sequelize.STRING(25), allowNull: true})
            .catch(function (err) {
                winston.error('Adding column vod.imdb_id failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod', 'imdb_id')
            .catch(function (err) {
                winston.error('Removing column vod.imdb_id failed with error message: ', err.message);
            });
    }
};