"use strict";

module.exports = function(sequelize, DataTypes) {
    var programSchedule = sequelize.define('program_schedule', {
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
                unique: 'user_program'
            },
            program_id: {
                type: DataTypes.BIGINT(20),
                allowNull: false,
                unique: 'user_program'
            }
        }, {
            tableName: 'program_schedule',
            associate: function(models) {
                if(models.login_data){
                    programSchedule.belongsTo(models.login_data, {foreignKey: 'login_id'});
                }
                if(models.epg_data){
                    programSchedule.belongsTo(models.epg_data, {foreignKey: 'program_id'});
                }
            }
        }

    );
    return programSchedule;
};
