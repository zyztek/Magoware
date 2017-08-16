'use strict';


var path = require('path'),
    policy = require('../policies/mago.server.policy'),
    vodSubtitles = require(path.resolve('./modules/mago/server/controllers/vod_subtitles.server.controller'));

module.exports = function(app) {


    /* ===== vod subtitles===== */
    app.route('/api/vodsubtitles')
        .all(policy.isAllowed)
        .get(vodSubtitles.list)
        .post(vodSubtitles.create);

    app.route('/api/vodsubtitles/:vodSubtitleId')
        .all(policy.isAllowed)
        .get(vodSubtitles.read)
        .put(vodSubtitles.update)
        .delete(vodSubtitles.delete);

    app.param('vodSubtitleId', vodSubtitles.dataByID);


};
