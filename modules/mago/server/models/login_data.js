"use strict";
var path = require('path');
var authenticationHandler = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller'));

module.exports = function(sequelize, DataTypes) {
    var loginData = sequelize.define('login_data', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        username: {
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true,
            validate: {isLowercase: true}
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        salt: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        customer_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        channel_stream_source_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        vod_stream_source: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        pin: {
            type: DataTypes.STRING(6),
            allowNull: false
        },
        show_adult: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        auto_timezone: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        timezone: {
            type: DataTypes.INTEGER(3),
            allowNull: false,
            defaultValue: 0
        },
        player: {
            type: DataTypes.STRING(45),
            allowNull: false,
            defaultValue: 'default'
        },
        activity_timeout: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 9000
        },
        get_messages: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        resetPasswordToken: {
            type: DataTypes.STRING(128),
            defaultValue: ' ',
            allowNull: true
        },
        resetPasswordExpires: {
            type: DataTypes.STRING(45),
            defaultValue: ' ',
            allowNull: true
        },
        vodlastchange: {
            type: DataTypes.BIGINT(13),
            defaultValue: Date.now(),
            allowNull: true
        },
        livetvlastchange: {
            type: DataTypes.BIGINT(13),
            defaultValue: Date.now(),
            allowNull: true
        },

        account_lock: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        beta_user: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }

    }, {
        tableName: 'login_data',
        associate: function(models) {
            if (models.customer_data){
                loginData.belongsTo(models.customer_data, {foreignKey: 'customer_id'});
            }
            if (models.channel_stream_source){
                loginData.belongsTo(models.channel_stream_source, {foreignKey: 'channel_stream_source_id'});
            }
            if (models.subscription){
                loginData.hasMany(models.subscription, {foreignKey: 'login_id'});
            }
            if(models.commands) loginData.hasMany(models.commands);
        }
    });

    loginData.beforeUpdate(function(login_data, options) {
        if (login_data.changed('password')) {
            var salt = authenticationHandler.makesalt();
            login_data.set('salt', salt);
            login_data.set('password', authenticationHandler.encryptPassword(login_data.password, salt));
        }
    })

    loginData.beforeCreate(function(login_data, options) {
        login_data.set('salt', login_data.salt);
        login_data.set('password', authenticationHandler.encryptPassword(login_data.password, login_data.salt));
    });

    return loginData;
};