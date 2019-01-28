"use strict";

module.exports = function(sequelize, DataTypes) {
    var customerData = sequelize.define('customer_data', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        group_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            default: 1
        },
        firstname: {
            type: DataTypes.STRING(64),
            allowNull: false,
            defaultValue: 'firstname'
        },
        lastname: {
            type: DataTypes.STRING(64),
            allowNull: false,
            defaultValue: 'lastname'
        },
        email: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true
        },
        address: {
            type: DataTypes.STRING(128),
            allowNull: true,
            defaultValue: 'address'
        },
        city: {
            type: DataTypes.STRING(64),
            allowNull: true,
            defaultValue: 'city'
        },
        country: {
            type: DataTypes.STRING(64),
            allowNull: true,
            defaultValue: 'country'
        },
        zip_code: {
            type: DataTypes.STRING(10),
            defaultValue: ''
        },
        telephone: {
            type: DataTypes.STRING(64),
            allowNull: true,
            defaultValue: '0'
        }
    }, {
        tableName: 'customer_data',
        associate: function(models) {
            if (models.login_data){
                customerData.hasMany(models.login_data, {foreignKey: 'customer_id'});
            }
            if (models.customer_group) {
                customerData.belongsTo(models.customer_group, {foreignKey: 'group_id'});
            }
        }
    });
    return customerData;
};
