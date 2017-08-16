"use strict";

module.exports = function(sequelize, DataTypes) {
    var Genre = sequelize.define('genre', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        description: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        icon_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        tableName: 'genre',
        associate: function(models) {
            if (models.channels){
                Genre.hasMany(models.channels, {foreignKey: 'genre_id'});
            }
            if (models.my_channels){
                Genre.hasMany(models.my_channels, {foreignKey: 'genre_id'});
            }
        }
    });
    return Genre;
};
