'use strict';


var path = require('path'),
    policy = require('../policies/mago.server.policy'),
    tv_episodeSubtitles = require(path.resolve('./modules/mago/server/controllers/tv_episode_subtitles.server.controller'));

module.exports = function(app) {


    /* ===== tv episode subtitles===== */
    app.route('/api/tv_episode_subtitles')
        .all(policy.isAllowed)
        .get(tv_episodeSubtitles.list)
        .post(tv_episodeSubtitles.create);

    app.route('/api/tv_episode_subtitles/:tv_episode_subtitle_id')
        .all(policy.isAllowed)
        .get(tv_episodeSubtitles.read)
        .put(tv_episodeSubtitles.update)
        .delete(tv_episodeSubtitles.delete);

    app.param('tv_episode_subtitle_id', tv_episodeSubtitles.dataByID);


};
