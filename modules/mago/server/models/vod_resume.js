"use strict";

module.exports = function(sequelize, DataTypes) {
    var vod_resume = sequelize.define('vod_resume', {
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
            unique: true
        },
        vod_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        resume_position: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        device_id: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'vod_resume',
        associate: function(models) {
            if (models.login_data){
                vod_resume.belongsTo(models.login_data, {foreignKey: 'login_id'});
            }
            if (models.vod){
                vod_resume.belongsTo(models.vod, {foreignKey: 'vod_id'});
            }
        }
    });
    return vod_resume;
};