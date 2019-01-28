'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('vod', 'vod_parent_id', {
            type: Sequelize.INTEGER(11), allowNull: true, after: 'id',
            references: {
                model: 'vod',
                as: 'seasons',
                key: 'id',
                useJunctionTable: false
            }
        }).then(function (success) {
            return queryInterface.addColumn('vod', 'vod_type', {
                type: Sequelize.STRING(20),
                defaultValue: "film",
                allowNull: false,
                after: 'id'
            }).then(function (success) {
                return queryInterface.addColumn('vod', 'season_number', {
                        type: Sequelize.INTEGER(3),
                        allowNull: true,
                        after: 'id'
                    })
                    .catch(function (err) {
                        winston.error('Adding column vod.season_number failed with error message: ', err.message);
                    });
            }).catch(function (err) {
                winston.error('Adding column vod.vod_type failed with error message: ', err.message);
            });
        }).catch(function(err) {winston.error('Adding column vod.vod_parent_id failed with error message: ',err);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod', 'vod_parent_id').then(function (success) {
            return queryInterface.removeColumn('vod', 'vod_type').then(function (success) {
                return queryInterface.removeColumn('vod', 'season_number')
                    .catch(function (err) {
                        winston.error('Dropping column vod.season_number failed with error message: ', err.message);
                    });
            }).catch(function (err) {
                winston.error('Dropping column vod.vod_type failed with error message: ', err.message);
            });
        }).catch(function (err) {
            winston.error('Dropping column vod.vod_parent_id failed with error message: ', err.message);
        });
    }
};