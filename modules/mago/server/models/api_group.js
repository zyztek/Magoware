"use strict";

module.exports = function(sequelize, DataTypes) {
    var api_group = sequelize.define('api_group', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        api_group_name: {
            type: DataTypes.STRING(45),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.STRING(45),
            allowNull: false
        }
    }, {
        tableName: 'api_group',
        associate: function(models) {
            if (models.api_url){
                api_group.hasMany(models.api_url, {foreignKey: 'api_group_id'});
            }
            if (models.grouprights){
                api_group.hasMany(models.grouprights, {foreignKey: 'api_group_id'});
            }

        }
    });
    return api_group;
};