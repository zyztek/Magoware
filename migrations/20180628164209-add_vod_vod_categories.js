'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('vod_vod_categories', {
                id: {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                vod_id: {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    unique: 'vod_vod_category_unique',
                    references: {model: 'vod', key: 'id'}
                },
                category_id: {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    unique: 'vod_vod_category_unique',
                    references: {model: 'vod_category', key: 'id'}
                },
                is_available: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: true
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: true
                }
        },
        {
            uniqueKeys: {
                vod_vod_category_unique: {fields: ['category_id', 'vod_id']}
            }
        })
        .catch(function(err) {winston.error('Creating new table vod_vod_categories failed with error message: ',err.message);});
    }
};

