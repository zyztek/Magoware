"use strict";

module.exports = function(sequelize, DataTypes) {
    var htmlContent = sequelize.define('html_content', {
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
        content: {
            type: DataTypes.STRING(5000),
            allowNull: false
        }
    }, {
        tableName: 'html_content'
    });
    return htmlContent;
};