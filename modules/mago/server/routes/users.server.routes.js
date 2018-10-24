'use strict';

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    users = require(path.resolve('./modules/mago/server/controllers/users.server.controller')),
    auth = require(path.resolve('./modules/mago/server/controllers/authentication.controller'));


module.exports = function(app) {

    /* ===== users ===== */
    app.route('/api/users')
        .get(users.list);
		
    app.route('/api/users')
        .all(policy.isAllowed)
        .post(users.create);		

    app.route('/api/users/:usersId')
        .get(users.read);

	app.route('/api/users/:usersId')
        .all(policy.isAllowed)
        .put(users.update)
        .delete(users.delete);
		
    app.route('/api/change-password')
        .all(policy.isAllowed)
        .post(auth.changepassword1);

    app.route('/api/user/change-password')
        .all(policy.isAllowed)
        .post(auth.changepassword1);

    app.param('usersId', users.dataByID);

    /* ===== Resellers users ===== */

    app.route('/api/ResellersUsers')
        .get(users.list);

    app.route('/api/ResellersUsers')
        .all(policy.isAllowed)
        .post(users.create);

    app.route('/api/ResellersUsers/:ResellersUsersId')
        .get(users.read);

    app.route('/api/ResellersUsers/:ResellersUsersId')
        .all(policy.isAllowed)
        .put(users.update)
        .delete(users.delete);

    app.route('/api/ResellersUsers/change-password')
        .all(policy.isAllowed)
        .post(auth.changepassword1);

    app.param('ResellersUsersId', users.dataByID);

};
