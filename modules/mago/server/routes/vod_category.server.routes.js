'use strict';

var path = require('path'),
    policy = require('../policies/mago.server.policy'),
    vodCategories = require(path.resolve('./modules/mago/server/controllers/vod_category.server.controller'));


module.exports = function(app) {

    /* ===== vod categories ===== */
    app.route('/api/vodcategories')
        .all(policy.isAllowed)
        .get(vodCategories.list)
        .post(vodCategories.create);

    app.route('/api/vodcategories/:vodCategoryId')
        .all(policy.isAllowed)
        .get(vodCategories.read)
        .put(vodCategories.update)
        .delete(vodCategories.delete);

    app.param('vodCategoryId', vodCategories.dataByID);


};
