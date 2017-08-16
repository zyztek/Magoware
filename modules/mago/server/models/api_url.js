"use strict";

module.exports = function(sequelize, DataTypes) {
    var Apiurl = sequelize.define('api_url', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        api_url: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: 'api_url_api_group'
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        api_group_id: {
            type: DataTypes.INTEGER(11),
            unique: 'api_url_api_group'
        }
    }, {
        tableName: 'api_url',
        associate: function(models) {
        }
    });
    return Apiurl;
};