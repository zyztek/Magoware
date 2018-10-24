"use strict";

module.exports = function(sequelize, DataTypes) {
    var epgData = sequelize.define('epg_data', {
        id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        channel_number: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
            channels_id: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
        timezone: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        title: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        episode_title: {
            type: DataTypes.STRING(45),
            defaultvalue: '-'
        },
        short_name: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        short_description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        event_category: {
            type: DataTypes.STRING(45),
            defaultvalue: '-'
        },
        event_language: {
            type: DataTypes.STRING(10),
            defaultvalue: '-'
        },
        event_rating: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        program_start: {
            type: DataTypes.DATE,
            allowNull: true
        },
        program_end: {
            type: DataTypes.DATE,
            allowNull: true
        },
        long_description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        duration_seconds: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        }
    },
        {
        tableName: 'epg_data',
        associate: function(models) {
            epgData.belongsTo(models.channels, {foreignKey: 'channels_id'});
            epgData.hasMany(models.program_schedule, {foreignKey: 'program_id'});
        },
        indexes: [
            { fields: ['program_start', 'channel_number'], unique: true },
            { fields: ['program_end', 'channel_number'], unique: true }
        ]
    });
    return epgData;
};