"use strict";

module.exports = function(sequelize, DataTypes) {
    var Systemmenu = sequelize.define('systemmenu', {

        id: {
            type: DataTypes.STRING(45),
            primaryKey: true,
            allowNull: false,
            unique: true
        },

        parent_menu_code: {
            type: DataTypes.STRING(45),
            allowNull: false,
            defaultValue: "root"
        },
        menu_order: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: true
        },
        entity_name: {
            type: DataTypes.STRING(128),
            allowNull: true
        },
        title: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING(256),
            allowNull: true
        },
        link: {
            type: DataTypes.STRING(128),
            allowNull: true
        },
        template: {
            type: DataTypes.STRING(256),
            allowNull: true
        },

        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'systemmenu',
          associate: function(models) {
        }
    });
    return Systemmenu;
};
