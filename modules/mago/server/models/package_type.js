"use strict";

module.exports = function(sequelize, DataTypes) {
    var packageType = sequelize.define('package_type', {
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
        },
        activity_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        app_group_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        }
    }, {
        tableName: 'package_type',
        associate: function(models) {
            if(models.package){
                packageType.hasMany(models.package, {foreignKey: 'package_type_id'});
            }
			if(models.activity){
                packageType.belongsTo(models.activity, {foreignKey: 'activity_id'});
            }
			if(models.app_group){
                packageType.belongsTo(models.app_group, {foreignKey: 'app_group_id'});
            }
        }
    }

    );
    return packageType;
};
