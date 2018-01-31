'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('package_vod',{
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            vod_id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                unique: 'packagevod',
                references: {model: 'vod', key: 'id'}
            },
            package_id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                unique: 'packagevod',
                references: {model: 'package', key: 'id'}
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        }).catch(function(err) {console.log('Creation of table package_vod failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.deleteTable('package_vod')
            .catch(function(err) {console.log('Deleting the table package_vod failed with error message: ',err.message);});
    }
};