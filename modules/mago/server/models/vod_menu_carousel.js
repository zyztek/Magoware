"use strict";

module.exports = function(sequelize, DataTypes) {
    var vodmenucarousel = sequelize.define('vod_menu_carousel', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        vod_menu_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER(15),
            allowNull: false
        },
        url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'vod_menu_carousel',
        associate: function(models) {
            if(models.vod_menu){
                vodmenucarousel.belongsTo(models.vod_menu, {foreignKey: 'id'});
            }
        }
    });
    return vodmenucarousel;
};