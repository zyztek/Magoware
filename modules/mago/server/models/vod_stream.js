"use strict";

module.exports = function(sequelize, DataTypes) {
    var vodStream = sequelize.define('vod_stream', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        vod_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        stream_source_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        url: {
            type: DataTypes.STRING(255),
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
        }
    }, {
        tableName: 'vod_stream',
        associate: function(models) {
            vodStream.belongsTo(models.vod, {foreignKey: 'vod_id'});
            vodStream.belongsTo(models.vod_stream_source, {foreignKey: 'stream_source_id'});
        }
    });
    return vodStream;
};
