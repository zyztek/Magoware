"use strict";

module.exports = function(sequelize, DataTypes) {
    var Settings = sequelize.define('settings', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        locale: {
            type: DataTypes.STRING,
            defaultValue: 'en',
        },
        log_event_interval: {
            type: DataTypes.INTEGER(11),
            defaultValue: 300,
            allowNull: false,
        },
        mobile_background_url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '/files/settings/smallbkg.png'
        },
        mobile_logo_url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '/files/settings/smalllogo.png'
        },
        box_logo_url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '/files/settings/largelogo.png'
        },
        box_background_url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '/files/settings/largebkg.png'
        },
        vod_background_url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '/files/settings/vodbkg.png'
        },
        assets_url: {
            type: DataTypes.STRING,
        },
        ip_service_url: {
            type: DataTypes.STRING,
        },
        ip_service_key: {
            type: DataTypes.STRING
        },
        firebase_key: {
            type: DataTypes.STRING(255),
            defaultValue: '',
            allowNull: false
        },
        help_page: {
            type: DataTypes.STRING(255),
            defaultValue: '/help_and_support',
            allowNull: false
        },
        online_payment_url: {
            type: DataTypes.STRING(255),
            defaultValue: '',
            allowNull: false
        },
        vod_subset_nr: {
            type: DataTypes.INTEGER(11),
            defaultValue: 200,
            allowNull: false
        },
        activity_timeout:{
            type: DataTypes.INTEGER(11),
            defaultValue: 10800,
            allowNull: false
        },
        channel_log_time: {
            type: DataTypes.INTEGER(11),
            defaultValue: 6,
            allowNull: false
        },
        email_address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email_username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email_password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        smtp_host: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'smtp.gmail.com:465'
        },
        smtp_secure: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        analytics_id: {
            type: DataTypes.STRING
        },
        old_encryption_key: {
            type: DataTypes.STRING
        },
        new_encryption_key: {
            type: DataTypes.STRING
        },
        key_transition: {
            type: DataTypes.BOOLEAN
        },
        allow_guest_login: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        company_url: {
            type: DataTypes.STRING,
            defaultValue: 'https://magoware.tv'
        },
        company_logo: {
            type: DataTypes.STRING(255),
            defaultValue: "/admin/images/mago.png",
            allowNull: false
        },
        company_name: {
            type: DataTypes.STRING(45),
            defaultValue: "MAGOWARE",
            allowNull: false
        },		
        vodlastchange :{
            type: DataTypes.BIGINT(13),
            defaultValue: 0,
            allowNull: false
        },
        livetvlastchange :{
            type: DataTypes.BIGINT(13),
            defaultValue: 0,
            allowNull: false
        },
        menulastchange :{
            type: DataTypes.BIGINT(13),
            defaultValue: 0,
            allowNull: false
        },
        googlegcmapi: {
            type: DataTypes.STRING
        },
        applekeyid: {
            type: DataTypes.STRING
        },
        appleteamid: {
            type: DataTypes.STRING
        },
        applecertificate:{
            type: DataTypes.STRING
        },
        akamai_token_key:{
            type: DataTypes.STRING,
            defaultValue: "akamai_token_key",
            allowNull: false
        },
        flussonic_token_key:{
            type: DataTypes.STRING,
            defaultValue: "flussonic_token_key",
            allowNull: false
        }
    }, {
        tableName: 'settings',
        associate: function(models) {
        }
    });

    Settings.beforeUpdate(function(settings, options) {
        if (settings.changed('new_encryption_key')) {
            settings.set('old_encryption_key', settings['_previousDataValues'].new_encryption_key); //save previous key to to old key, before the value is lost
            settings.set('key_transition', true); //since keys were exchanged, set key transition to true regardless of user input
        }
    })

    return Settings;
};
