"use strict";

module.exports = function(sequelize, DataTypes) {
    var vodSubtitles = sequelize.define('vod_subtitles', {
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
        title: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        subtitle_url: {
            type: DataTypes.STRING(256),
            allowNull: false
        }
    }, {
        tableName: 'vod_subtitles',
        associate: function(models) {
            vodSubtitles.belongsTo(models.vod, {foreignKey: 'vod_id'});
        }
    });
    return vodSubtitles;
};
