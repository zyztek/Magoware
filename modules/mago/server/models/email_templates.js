"use strict";

module.exports = function(sequelize, DataTypes) {
    var emailTemplates = sequelize.define('email_templates', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        template_id: {
            type: DataTypes.STRING(200),
            allowNull: false,
            defaultValue: "code-pin-email,new-account,new-email,reset-password-email,reset-password-confirm-email,reset-password-email,reset-password-enter-password,salesreport-invoice",
            unique: 'templateid_language'
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        language: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: 'templateid_language'
        },
        content: {
            type: DataTypes.STRING(5000),
            allowNull: false
        }
    }, {
        tableName: 'email_templates',
        timestamps: false
    });
    return emailTemplates;
};
