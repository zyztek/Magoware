"use strict";

module.exports = function(sequelize, DataTypes) {
    var vodmenu = sequelize.define('vod_menu', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(256),
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER(15),
            allowNull: false
        },
        pin_protected: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'vod_menu',
        associate: function(models) {
            if(models.vod_menu_carousel){
                vodmenu.hasMany(models.vod_menu_carousel, {foreignKey: 'vod_menu_id'});
            }
        }
    });
    return vodmenu;
};