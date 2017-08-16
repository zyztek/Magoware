"use strict";

module.exports = function(sequelize, DataTypes) {
    var channelStreamSource = sequelize.define('channel_stream_source', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        stream_source: {
            type: DataTypes.STRING(30),
            allowNull: false
        }
    }, {
        tableName: 'channel_stream_source',
        associate: function(models) {
            if (models.channel_stream){
                channelStreamSource.hasMany(models.channel_stream, {foreignKey: 'stream_source_id'});
            }
        }
    });
    return channelStreamSource;
};
