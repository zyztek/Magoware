'use strict';

var path = require('path'),
    policy = require('../policies/mago.server.policy'),
    vodStreamSources = require(path.resolve('./modules/mago/server/controllers/vod_stream_source.server.controller'));


module.exports = function(app) {

    /* ===== vod stream sources===== */
    app.route('/api/vodstreamsources')
        .all(policy.isAllowed)
        .get(vodStreamSources.list)
        .post(vodStreamSources.create);

    app.route('/api/vodstreamsources/:vodStreamSourceId')
        .all(policy.isAllowed)
        .get(vodStreamSources.read)
        .put(vodStreamSources.update)
        .delete(vodStreamSources.delete);

    app.param('vodStreamSourceId', vodStreamSources.dataByID);


};
