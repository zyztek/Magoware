'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(function(t){
            return Promise.all([
                queryInterface.createTable('tv_series_packages',
                    {
                        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
                        tv_show_id: {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'tv_series', key: 'id'}},
                        package_id: {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'package', key: 'id'}},
                        is_available: {type: Sequelize.BOOLEAN, allowNull: false},
                        createdAt: {type: Sequelize.DATE},
                        updatedAt: {type: Sequelize.DATE}
                    }, {uniqueKeys: {package_tv_series: {fields: ['tv_show_id', 'package_id']}}},{ transaction: t }),
                queryInterface.createTable('tv_series_categories',
                    {
                        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
                        tv_show_id: {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'tv_series', key: 'id'}},
                        category_id: {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'vod_category', key: 'id'}},
                        is_available: {type: Sequelize.BOOLEAN, allowNull: false},
                        createdAt: {type: Sequelize.DATE},
                        updatedAt: {type: Sequelize.DATE}
                    }, {uniqueKeys: {categories_tv_series: {fields: ['tv_show_id', 'category_id']}}}, { transaction: t }),
                queryInterface.createTable('t_tv_series_sales',
                    {
                        id: {type: Sequelize.INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, unique: true},
                        tv_show_id: {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'tv_series', key: 'id'}},
                        login_data_id: {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'login_data', key: 'id'}},
                        start_time: {type: Sequelize.DATE, allowNull: false},
                        end_time: {type: Sequelize.DATE, allowNull: false},
                        transaction_id: {type: Sequelize.STRING(128), allowNull: true, defaultValue: ''},
                        createdAt: {type: Sequelize.DATE},
                        updatedAt: {type: Sequelize.DATE}
                    }, { transaction: t })
            ])
        }).catch(function(error){
            winston.error('Adding tables tv_series_packages, tv_series_categories, t_tv_series_sales failed with error message: ',error.message);
        });
    },

    down: function(queryInterface, Sequelize){
        return queryInterface.sequelize.transaction(function(t){
            return Promise.all([
                queryInterface.dropTable('tv_series_packages', { transaction: t }),
                queryInterface.dropTable('tv_series_categories', { transaction: t }),
                queryInterface.dropTable('t_tv_series_sales', { transaction: t })
            ])
        }).catch(function(error){
            winston.error('Dropping tables tv_series_packages, tv_series_categories, t_tv_series_sales failed with error message: ',error.message);
        });
    }
};

