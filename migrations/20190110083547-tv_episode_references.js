'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {

        return queryInterface.sequelize.transaction(function(t){
            return Promise.all([
                queryInterface.createTable('tv_episode_stream',
                    {
                        id: {type: Sequelize.INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, unique: true},
                        tv_episode_id: {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'tv_episode', key: 'id'}},
                        stream_source_id: {type: Sequelize.INTEGER(11), allowNull: false},
                        tv_episode_url: {type: Sequelize.STRING(255), allowNull: false},
                        stream_resolution: {type: Sequelize.STRING(30), allowNull: false, defaultValue: "1,2,3,4,5,6"},
                        stream_format: {type: Sequelize.STRING(2), allowNull: false},
                        token: {type: Sequelize.BOOLEAN, allowNull: false},
                        encryption: {type: Sequelize.BOOLEAN, allowNull: false},
                        token_url: {type: Sequelize.STRING(255), allowNull: false},
                        encryption_url: {type: Sequelize.STRING(255), allowNull: false},
                        drm_platform: {type: Sequelize.STRING(20), allowNull: false},
                        createdAt: {type: Sequelize.DATE},
                        updatedAt: {type: Sequelize.DATE}
                    }, { transaction: t }),
                queryInterface.createTable('tv_episode_subtitles',
                    {
                        id: {type: Sequelize.INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, unique: true},
                        tv_episode_id: {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'tv_episode', key: 'id'}},
                        title: {type: Sequelize.STRING(128), allowNull: false},
                        subtitle_url: {type: Sequelize.STRING(256), allowNull: false},
                        createdAt: {type: Sequelize.DATE},
                        updatedAt: {type: Sequelize.DATE}
                    },{ transaction: t }),
                queryInterface.createTable('tv_episode_resume', {
                    id: {type: Sequelize.INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, unique: true},
                    login_id: {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'login_data', key: 'id'}},
                    tv_episode_id: {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'tv_episode', key: 'id'}},
                    resume_position: {type: Sequelize.INTEGER(11), allowNull: false},
                    device_id: {type: Sequelize.STRING, allowNull: false},
                    createdAt: {type: Sequelize.DATE},
                    updatedAt: {type: Sequelize.DATE}
                }, { transaction: t })
            ])
        }).catch(function(error){
            winston.error('Adding tables tv_episode_stream, tv_episode_subtitles, tv_episode_resume failed with error message: ',error);
        });
    },

    down: function(queryInterface, Sequelize){
        return queryInterface.sequelize.transaction(function(t){
            return Promise.all([
                queryInterface.dropTable('tv_episode_stream', { transaction: t }),
                queryInterface.dropTable('tv_episode_subtitles', { transaction: t }),
                queryInterface.dropTable('tv_episode_resume', { transaction: t })
            ])
        }).catch(function(error){
            winston.error('Dropping tables tv_episode_stream, tv_episode_subtitles, tv_episode_resume failed with error message: ',error.message);
        });
    }
};

