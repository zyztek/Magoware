'use strict';

var path = require('path'),
    //db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    myChannels = require(path.resolve('./modules/mago/server/controllers/my_channels.server.controller'));


module.exports = function(app) {

    /* ===== my channels routes ===== */
    app.route('/api/mychannels')
        .all(policy.isAllowed)
        .get(myChannels.list)
        .post(myChannels.create);

    app.route('/api/mychannels/:mychannelId')
        .all(policy.isAllowed)
        .get(myChannels.read)
        .put(myChannels.update)
        .delete(myChannels.delete);

    app.param('mychannelId', myChannels.dataByID);

};
