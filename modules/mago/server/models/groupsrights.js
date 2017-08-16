"use strict";

module.exports = function(sequelize, DataTypes) {
    var Grouprights = sequelize.define('grouprights', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        group_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'compositeIndex'
        },
        api_group_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'compositeIndex'
        },
        read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        edit: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        create: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
    }, {
        tableName: 'grouprights',
        associate: function(models) {
            Grouprights.belongsTo(models.api_group, {foreignKey: 'api_group_id'});
            Grouprights.belongsTo(models.groups, {foreignKey: 'group_id'});
        }
    });
    return Grouprights;
};