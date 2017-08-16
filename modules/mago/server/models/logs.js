"use strict";

module.exports = function(sequelize, DataTypes) {
    var Logs = sequelize.define('logs', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false

        },
        user_ip: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        action: {
            type: DataTypes.STRING(10),
            allowNull: false

        },
        //TODO: other appropriate datatype
        details: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'logs',
        associate: function(models) {
            if(models.users){
                Logs.belongsTo(models.users, {foreignKey: 'user_id'})
            }
        }
    });
    return Logs;
};
