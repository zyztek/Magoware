"use strict";

module.exports = function(sequelize, DataTypes) {
    var activity = sequelize.define('activity', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false, 
			primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        description: {
            type: DataTypes.STRING(45),
            allowNull: false
        }
    }, {
        tableName: 'activity',
        associate: function(models) {
            activity.hasMany(models.package_type, {foreignKey: 'activity_id'});
        }
    });
    return activity;
};
