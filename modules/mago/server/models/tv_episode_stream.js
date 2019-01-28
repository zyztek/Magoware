"use strict";

module.exports = function(sequelize, DataTypes) {
    var tv_episode_stream = sequelize.define('tv_episode_stream', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        tv_episode_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        stream_source_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        tv_episode_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        stream_resolution: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "1,2,3,4,5,6"
        },
        stream_format: {
            type: DataTypes.STRING(2),
            allowNull: false
        },
        token: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        encryption: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        token_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        encryption_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        drm_platform: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    }, {
        tableName: 'tv_episode_stream',
        associate: function(models) {
            tv_episode_stream.belongsTo(models.tv_episode, {foreignKey: 'tv_episode_id'});
            tv_episode_stream.belongsTo(models.vod_stream_source, {foreignKey: 'stream_source_id'});
        }
    });
    return tv_episode_stream;
};
