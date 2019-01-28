'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('channels', 'epg_map_id', {
                type: Sequelize.STRING(32),
                after: 'title',
                allowNull: false
            })
            .catch(function (err) {
                winston.error('Adding column channels.epg_map_id failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('channels', 'epg_map_id')
            .catch(function (err) {
                winston.error('Removing column channels.epg_map_id failed with error message: ', err.message);
            });
    }
};
