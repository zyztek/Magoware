'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('vod', 'vod_parent_id',{
            type: Sequelize.INTEGER(11), allowNull: true, after: 'id',
            references: {
                //Vod.hasMany(models.vod, { as: 'Children', foreignKey: 'vod_parent_id', useJunctionTable: false })
                model: 'vod',
                as: 'seasons',
                key: 'id',
                useJunctionTable: false
            }
        }).catch(function(err) {console.log('Adding column vod.vod_parent_id failed with error message: ',err);});
        queryInterface.addColumn('vod', 'vod_type',{type: Sequelize.STRING(20), defaultValue: "film", allowNull: false, after: 'id'})
            .catch(function(err) {console.log('Adding column vod.vod_type failed with error message: ',err.message);});
        queryInterface.addColumn('vod', 'season_number',{type: Sequelize.INTEGER(3), allowNull: true, after: 'id'})
            .catch(function(err) {console.log('Adding column vod.season_number failed with error message: ',err.message);});

    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('vod', 'vod_parent_id')
            .catch(function(err) {console.log('Dropping column vod.vod_parent_id failed with error message: ',err.message);});
        queryInterface.removeColumn('vod', 'vod_type')
            .catch(function(err) {console.log('Dropping column vod.vod_type failed with error message: ',err.message);});
        queryInterface.removeColumn('vod', 'season_number')
            .catch(function(err) {console.log('Dropping column vod.season_number failed with error message: ',err.message);});

    }
};