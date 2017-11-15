'use strict';

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    commands = require(path.resolve('./modules/mago/server/controllers/command.server.controller'));


module.exports = function(app) {

    app.route('/api/commands')
        .get(commands.list)
        .post(commands.create);

};