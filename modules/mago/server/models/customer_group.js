"use strict";

module.exports = function(sequelize, DataTypes) {
    var customerGroup = sequelize.define('customer_group', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        description: {
            type: DataTypes.STRING(32),
            allowNull: false
        }
    }, {
        tableName: 'customer_group',
        associate: function(models) {
            if(models.customer_data){
                customerGroup.hasMany(models.customer_data, {foreignKey: 'group_id'});
            }
        }
    });
    return customerGroup;
};
