'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('channels', 'epg_map_id', {
                type: Sequelize.STRING(32),
                allowNull: true,
                defaultValue: ''
            })
            .catch(function (err) {
                winston.error('Adding default value to column channels.epg_map_id failed with error message: ', err.message);
            });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.changeColumn('channels', 'epg_map_id', {type: Sequelize.STRING(32), allowNull: false})
            .catch(function (err) {
                winston.error('Reverting default value to column channels.epg_map_id failed with error message: ', err.message);
            });
    }
};