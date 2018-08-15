"use strict";

module.exports = function(sequelize, DataTypes) {
    var Channels = sequelize.define('channels', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        genre_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        package_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        channel_number: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: true
        },
        epg_map_id: {
            type: DataTypes.STRING(32),
            defaultValue: '',
            allowNull: true
        },
        title: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        icon_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        pin_protected: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 1
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        tableName: 'channels',
        associate: function(models) {
            Channels.hasMany(models.epg_data, {foreignKey: 'channels_id'})
            if (models.channel_stream){
                Channels.hasMany(models.channel_stream, {foreignKey: 'channel_id'})
            }
            if(models.packages_channels){
                Channels.hasMany(models.packages_channels, {foreignKey: 'channel_id'})
            }
            if(models.favorite_channels){
                Channels.hasMany(models.favorite_channels, {foreignKey: 'channel_id'})
            }
            Channels.belongsTo(models.genre, {foreignKey: 'genre_id'});
        }
    });
    return Channels;
};
