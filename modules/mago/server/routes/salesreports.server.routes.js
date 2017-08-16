'use strict';


var path = require('path'),
    policy = require('../policies/mago.server.policy'),
    salesReports = require(path.resolve('./modules/mago/server/controllers/salesreport.server.controller'));

module.exports = function(app) {


    /* ===== salesreports the table ===== */
    app.route('/api/salesreports')
        .get(salesReports.list);

    app.route('/api/salesreports')
        .all(policy.isAllowed)
        .post(salesReports.create);

    app.route('/api/salesreports/:salesReportId')
        .all(policy.isAllowed)
        .get(salesReports.read)
        .put(salesReports.update)
        .delete(salesReports.delete);

    app.param('salesReportId', salesReports.dataByID);



    /* ===== Dashboard ===== */
    app.route('/api/dashboard/salesreports')
        .all(policy.isAllowed)
        .get(salesReports.latest);

};