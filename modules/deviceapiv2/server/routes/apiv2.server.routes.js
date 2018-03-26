'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    authpolicy = require('../auth/apiv2.server.auth.js'),
    credentialsController = require(path.resolve('./modules/deviceapiv2/server/controllers/credentials.server.controller')),
    channelsController = require(path.resolve('./modules/deviceapiv2/server/controllers/channels.server.controller')),
    catchupController = require(path.resolve('./modules/deviceapiv2/server/controllers/catchup.server.controller')),
    vodController = require(path.resolve('./modules/deviceapiv2/server/controllers/vod.server.controller')),
    settingsController = require(path.resolve('./modules/deviceapiv2/server/controllers/settings.server.controller')),
    networkController = require(path.resolve('./modules/deviceapiv2/server/controllers/network.server.controller')),
    eventlogsController = require(path.resolve('./modules/deviceapiv2/server/controllers/eventlogs.server.controller')),
    passwordController = require(path.resolve('./modules/deviceapiv2/server/controllers/password.server.controller')),
    mainController = require(path.resolve('./modules/deviceapiv2/server/controllers/main.server.controller')),
    customersAppController = require(path.resolve('./modules/deviceapiv2/server/controllers/customers_app.server.controller')),
    productsAppController = require(path.resolve('./modules/deviceapiv2/server/controllers/products.server.controller')),
    sitesController = require(path.resolve('./modules/deviceapiv2/server/controllers/sites.server.controller')),
    headerController = require(path.resolve('./modules/deviceapiv2/server/controllers/header.server.controller')),
    winston = require(path.resolve('./config/lib/winston'));

module.exports = function(app) {

    app.use('/apiv2',function (req, res, next) {
        winston.info(req.originalUrl +'  '+ JSON.stringify(req.body));
        res.header("Access-Control-Allow-Origin", "*");
        next();
    });


    /* ===== login data credentials===== */
    app.route('/apiv2/credentials/login')
        .all(authpolicy.plainAuth)
        .all(authpolicy.isAllowed)
        .post(credentialsController.login);

    app.route('/apiv2/credentials/logout')
        .all(authpolicy.isAllowed)
        .post(credentialsController.logout);
    app.route('/apiv2/credentials/logout_user')
        .all(authpolicy.plainAuth)
        .all(authpolicy.isAllowed)
        .post(credentialsController.logout_user);

    //channels
    app.route('/apiv2/channels/list')
        .all(authpolicy.isAllowed)
        .get(channelsController.list_get)
        .post(channelsController.list);

    app.route('/apiv2/channels/genre')
        .all(authpolicy.isAllowed)
        .get(channelsController.genre_get)
        .post(channelsController.genre);

    app.route('/apiv2/channels/epg')
        .all(authpolicy.isAllowed)
        .get(channelsController.epg_get)
        .post(channelsController.epg);

    app.route('/apiv2/channels/event')
        .all(authpolicy.isAllowed)
        .get(channelsController.event_get)
        .post(channelsController.event);

    app.route('/apiv2/channels/daily_epg')
        .all(authpolicy.isAllowed)
        .post(channelsController.daily_epg);
    app.route('/apiv2/channels/current_epgs')
        .all(authpolicy.isAllowed)
        .post(channelsController.current_epgs);

    app.route('/apiv2/channels/favorites')
        .all(authpolicy.isAllowed)
        .post(channelsController.favorites);


    app.route('/apiv2/channels/program_info')
        .all(authpolicy.isAllowed)
        .post(channelsController.program_info);
    app.route('/apiv2/channels/schedule')
        .all(authpolicy.isAllowed)
        .post(channelsController.schedule);


    app.route('/apiv2/channels/catchup_events')
        .all(authpolicy.isAllowed)
        .get(catchupController.catchup_events_get)
        .post(catchupController.catchup_events);

    app.route('/apiv2/channels/catchup_stream')
        .all(authpolicy.isAllowed)
        .post(catchupController.catchup_stream);


    //vod set top box
    app.route('/apiv2/vod/list')
        .all(authpolicy.isAllowed)
        .post(vodController.list);

    app.route('/apiv2/vod/list/:pagenumber')
        .all(authpolicy.isAllowed)
        .get(vodController.list_get);

    app.route('/apiv2/vod/categories')
        .all(authpolicy.isAllowed)
        .get(vodController.categories_get)
        .post(vodController.categories);


    app.route('/apiv2/vod/subtitles')
        .all(authpolicy.isAllowed)
        .get(vodController.subtitles_get)
        .post(vodController.subtitles);


    app.route('/apiv2/vod/totalhits')
        .all(authpolicy.isAllowed)
        .post(vodController.totalhits);

    app.route('/apiv2/vod/mostwatched')
        .all(authpolicy.isAllowed)
        .get(vodController.mostwatched_get)
        .post(vodController.mostwatched);


    app.route('/apiv2/vod/mostrated')
        .all(authpolicy.isAllowed)
        .get(vodController.mostrated_get)
        .post(vodController.mostrated);


    app.route('/apiv2/vod/related')
        .all(authpolicy.isAllowed)
        .post(vodController.related);

    app.route('/apiv2/vod/suggestions')
        .all(authpolicy.isAllowed)
        .get(vodController.suggestions_get)
        .post(vodController.suggestions);


    app.route('/apiv2/vod/categoryfilms')
        .all(authpolicy.isAllowed)
        .get(vodController.categoryfilms_get)
        .post(vodController.categoryfilms);

    app.route('/apiv2/vod/searchvod')
        .all(authpolicy.isAllowed)
        .get(vodController.get_vod_list)
        .post(vodController.searchvod);

    //testing api
    app.route('/apiv2/vod/vodlist/:pagenumber')
        //.all(authpolicy.isAllowed)
        .get(vodController.get_vod_list);

    //testing api
    app.route('/apiv2/vod/voditem/:vodID')
        //.all(authpolicy.isAllowed)
        .get(vodController.get_vod_item);


    app.route('/apiv2/vod/resume_movie')
        .all(authpolicy.isAllowed)
        .post(vodController.resume_movie);

    //settings
    app.route('/apiv2/settings/settings')
        .all(authpolicy.isAllowed)
        .post(settingsController.settings);

    app.route('/apiv2/settings/upgrade')
        .all(authpolicy.isAllowed)
        .post(settingsController.upgrade);

    app.route('/help_support')
        .get(settingsController.help_support);

    //main device menu
    app.route('/apiv2/main/device_menu')
        .all(authpolicy.isAllowed)
        .get(mainController.device_menu_get)
        .post(mainController.device_menu);

    /*******************************************************************
     Network - related API
     *******************************************************************/
    app.route('/apiv2/network/dbtest')
        .all(authpolicy.isAllowed)
        .post(networkController.dbtest);

    app.route('/apiv2/network/gcm')
        .all(authpolicy.plainAuth) //gcm request may not contain username and password, when called before login
        .all(authpolicy.emptyCredentials) //gcm request may be plaintext, when called before login
        .all(authpolicy.isAllowed)
        .post(networkController.gcm);

    app.route('/apiv2/command/response')
        .all(authpolicy.isAllowed)
        .post(networkController.command_response);

    //event logs
    app.route('/apiv2/events/event')
        .all(authpolicy.isAllowed)
        .post(eventlogsController.event);

    app.route('/apiv2/events/screen')
        .all(authpolicy.isAllowed)
        .post(eventlogsController.screen);

    app.route('/apiv2/events/timing')
        .all(authpolicy.isAllowed)
        .post(eventlogsController.timing);


    /*******************************************************************
     User personal data for application
     *******************************************************************/
    app.route('/apiv2/customer_app/settings')
        .all(authpolicy.isAllowed)
        .get(customersAppController.user_settings_get)
        .post(customersAppController.user_settings);

    app.route('/apiv2/customer_app/user_data')
        .all(authpolicy.isAllowed)
        .get(customersAppController.user_data_get)
        .post(customersAppController.user_data);

    app.route('/apiv2/customer_app/update_user_data')
        .all(authpolicy.isAllowed)
        .post(customersAppController.update_user_data);

    app.route('/apiv2/customer_app/update_user_settings')
        .all(authpolicy.isAllowed)
        .post(customersAppController.update_user_settings);

    app.route('/apiv2/customer_app/change_password')
        .all(authpolicy.isAllowed)
        .post(customersAppController.change_password);
    app.route('/apiv2/customer_app/reset_pin')
        .all(authpolicy.isAllowed)
        .post(customersAppController.reset_pin);

    app.route('/apiv2/customer_app/salereport')
        .all(authpolicy.isAllowed)
        .get(customersAppController.salereport_get)
        .post(customersAppController.salereport);

    app.route('/apiv2/customer_app/subscription')
        .all(authpolicy.isAllowed)
        .get(customersAppController.subscription_get)
        .post(customersAppController.subscription);

    app.route('/apiv2/customer_app/genre')
        .all(authpolicy.isAllowed)
        .get(customersAppController.genre_get)
        .post(customersAppController.genre);

    app.route('/apiv2/customer_app/channel_list')
        .all(authpolicy.isAllowed)
        .get(customersAppController.channel_list_get)
        .post(customersAppController.channel_list);

    app.route('/apiv2/customer_app/add_channel')
        .all(authpolicy.isAllowed)
        .post(customersAppController.add_channel);
    app.route('/apiv2/customer_app/delete_channel')
        .all(authpolicy.isAllowed)
        .post(customersAppController.delete_channel);
    app.route('/apiv2/customer_app/edit_channel')
        .all(authpolicy.isAllowed)
        .post(customersAppController.edit_channel);


    /*******************************************************************
     Sale and product management for the application
     *******************************************************************/
    app.route('/apiv2/products/product_list')
        .all(authpolicy.isAllowed)
        .get(productsAppController.product_list_get)
        .post(productsAppController.product_list);


    /* ===== websites ===== */
    //todo: only one of the paths is in use
    app.route('/apiv2/sites_web/registration')
        .all(authpolicy.plainAuth)
        .all(authpolicy.emptyCredentials)
        .post(sitesController.createaccount);
    app.route('/apiv2/sites/registration')
        .all(authpolicy.plainAuth)
        .all(authpolicy.emptyCredentials)
        .post(sitesController.createaccount);


    app.route('/apiv2/sites/confirm-account/:token')
        .get(sitesController.confirmNewAccountToken);


    /* ===== header logs ===== */
    app.route('/apiv2/header/header')
        .all(authpolicy.isAllowed)
        .get(headerController.header);

    /* ===== login data reset password ===== */
    app.route('/apiv2/password/forgot')
        .post(passwordController.forgot);

    app.route('/apiv2/password/reset/:token')
        .get(passwordController.validateResetToken);
};