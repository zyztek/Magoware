"use strict";

module.exports = function(sequelize, DataTypes) {
    var app_group = sequelize.define('app_group', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        app_group_name: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        app_group_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        app_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'app_group',
        associate: function(models) {
            app_group.hasMany(models.package_type, {foreignKey: 'app_group_id'});
        }
    });
    return app_group;
};
