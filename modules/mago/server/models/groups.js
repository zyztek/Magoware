"use strict";

module.exports = function(sequelize, DataTypes) {
    var Groups = sequelize.define('groups', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING(45),
            unique: true,
            allowNull: false
        },
        code: {
            type: DataTypes.STRING(45),
            unique: true,
            allowNull: false
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        tableName: 'groups',
        associate: function(models) {
            if (models.users) {
                Groups.hasMany(models.users, {foreignKey: 'group_id'})
            }
            if (models.grouprights) {
                Groups.hasMany(models.grouprights, {foreignKey: 'group_id'})
            }
        }
    });
    return Groups;
};