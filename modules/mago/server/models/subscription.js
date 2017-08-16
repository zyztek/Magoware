"use strict";

module.exports = function(sequelize, DataTypes) {
    var Subscription = sequelize.define('subscription', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        login_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'client_package'
        },
        package_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'client_package'
        },
        customer_username: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        user_username: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'subscription',
        associate: function(models) {
            Subscription.belongsTo(models.login_data, {foreignKey: 'login_id'});
            Subscription.belongsTo(models.package, {foreignKey: 'package_id'})
        }
    });
    return Subscription;
};
