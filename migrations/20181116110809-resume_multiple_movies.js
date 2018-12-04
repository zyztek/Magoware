'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {

        //remove foreign key [vod_resume, login_data]. necessary to drop unique key
        return queryInterface.sequelize.query('Alter table vod_resume drop foreign key vod_resume_ibfk_1').then(function(success){
            //remove unique index-es @vod_resume.login_id
            return queryInterface.removeIndex('vod_resume', 'vod_resume_login_id_unique').then(function(success){
                return queryInterface.removeIndex('vod_resume', 'login_id').then(function(success){
                    //re-create foreign key dropped earlier
                    return queryInterface.changeColumn('vod_resume', 'login_id', {type: Sequelize.INTEGER(11), allowNull: false, references: {model: 'login_data', key: 'id', as: 'vod_resume_ibfk_1'}})
                        .catch(function (err) {winston.error('Adding foreign key constraint vod_resume_ibfk_1 in table vod_resume failed with error message: ', err);});
                }).catch(function (err) {winston.error('Dropping index login_id in table vod_resume failed with error message: ', err.message);});
            }).catch(function (err) {winston.error('Dropping index vod_resume_login_id_unique in table vod_resume failed with error message: ', err.message);});
        }).catch(function (err) {winston.error('Dropping foreign key constraint vod_resume_ibfk_1 in table vod_resume failed with error message: ', err.message);});
    },

    down: function (queryInterface, Sequelize) {
        //no need for reverse logic.
    }
};