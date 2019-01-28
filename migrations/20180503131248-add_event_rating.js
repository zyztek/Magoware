'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('epg_data', 'event_rating', {type: Sequelize.INTEGER(11)})
            .catch(function (err) {
                winston.error('Adding column epg_data.event_rating failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('epg_data', 'event_rating')
            .catch(function (err) {
                winston.error('Removing column epg_data.event_rating failed with error message: ', err.message);
            });
    }
};