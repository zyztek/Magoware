'use strict';
var path = require('path'),
    vod = require(path.resolve("./modules/deviceapiv2/server/controllers/vod.server.controller.js"));
var winston = require("winston");

var thistracker = require(path.resolve('./modules/analytics/server/controllers/helpers/matomoanalyticshelper'));
var googletracker = require(path.resolve('./modules/analytics/server/controllers/helpers/googleanalyticshelper'));

exports.event = function(req, res) {

    res.setHeader('cache-control', 'no-store');
    if(req.body.event_category === 'vod' && req.body.event_action === 'movie start') vod.add_click(req.body.event_label); //increment clicks for a movie everythime it plays

    //winston.info("Analytics request;"+req.method+";"+req.baseUrl+";"+querystring.stringify(req.body));

    //var lang = (languages[req.body.language]) ? req.body.language : 'eng'; //handle missing language variables, serving english as default
    //res.send(languages[lang].language_variables['OK']);
    //thistracker.trackevent(req,res);
    googletracker.trackevent(req,res);

    res.send('ok');
};

exports.screen = function(req, res) {
    res.setHeader('cache-control', 'no-store');

    //var lang = (languages[req.body.language]) ? req.body.language : 'eng'; //handle missing language variables, serving english as default
    //res.send(languages[lang].language_variables['OK']);
    //thistracker.trackscreen(req,res);
    googletracker.trackscreen(req,res);
    res.send('ok');
};

exports.timing = function(req, res) {
    res.setHeader('cache-control', 'no-store');
    //var lang = (languages[req.body.language]) ? req.body.language : 'eng'; //handle missing language variables, serving english as default
    //res.send(languages[lang].language_variables['OK']);

    //thistracker.tracktiming(req,res);
    googletracker.tracktiming(req,res);
    res.send('ok');
};
