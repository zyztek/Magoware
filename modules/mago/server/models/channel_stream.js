"use strict";

module.exports = function(sequelize, DataTypes) {
    var channelStream = sequelize.define('channel_stream', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        channel_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'channelid_channelstream'
        },
        stream_source_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'channelid_channelstream'
        },
        stream_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        stream_mode:{
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: 'channelid_channelstream'
        },
        stream_format: {
            type: DataTypes.STRING(2),
            allowNull: false
        },
        token: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        token_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        encryption: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        encryption_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        is_octoshape: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultvalue: false
        }
    }, {
        tableName: 'channel_stream',
        associate: function(models) {
            channelStream.belongsTo(models.channel_stream_source, {foreignKey: 'stream_source_id'});
            channelStream.belongsTo(models.channels, {foreignKey: 'channel_id'})
        }
    });
    return channelStream;
};
