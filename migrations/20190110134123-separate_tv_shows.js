'use strict';
var winston = require('winston');

module.exports = {
    up: function(queryInterface, Sequelize){
        return queryInterface.sequelize.transaction(function(t){
            return Promise.all([
                queryInterface.removeColumn('vod', 'season_number', { transaction: t }),
                queryInterface.removeColumn('vod', 'vod_type', { transaction: t }),
                queryInterface.removeColumn('vod', 'vod_parent_id', { transaction: t })
            ])
        }).catch(function(error){
            winston.error('Dropping old structure columns failed with error message: ',error);
        });
    },

    down: function(queryInterface, Sequelize){
        return queryInterface.sequelize.transaction(function(t){
            return Promise.all([
                queryInterface.addColumn('vod', 'season_number', {type: Sequelize.INTEGER(3), allowNull: true, after: 'id'}, { transaction: t }),
                queryInterface.addColumn('vod', 'vod_type', {type: Sequelize.STRING(20), defaultValue: "film", allowNull: false, after: 'id'}, { transaction: t }),
                queryInterface.addColumn('vod', 'vod_parent_id', {
                    type: Sequelize.INTEGER(11), allowNull: true, after: 'id',
                    references: {
                        model: 'vod',
                        as: 'seasons',
                        key: 'id',
                        useJunctionTable: false
                    }
                }, { transaction: t })
            ])
        }).catch(function(error){
            winston.error('Reverting to old vod structure failed with error message: ',error.message);
        });
    }
};

