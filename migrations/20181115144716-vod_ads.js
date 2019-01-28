'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod', 'mandatory_ads', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                after: 'price'
            })
            .catch(function (err) {
                winston.error('Adding column vod.mandatory_ads failed with error message: ', err.message);
            });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod', 'mandatory_ads')
            .catch(function (err) {
                winston.error('Dropping column vod.mandatory_ads failed with error message: ', err.message);
            });
    }
};