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
            allowNull: false
        },
        vod_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        resume_position: { //range should be [0-100]%
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        reaction: { //value set should be [-1, 0, 1]
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
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