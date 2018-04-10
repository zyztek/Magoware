
/**
 * Module dependencies.
 */
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    commonCtrl = require(path.resolve('./modules/mago/server/controllers/common.controller')),
    dashboardController = require(path.resolve('./modules/mago/server/controllers/dashboard.server.controller')),
    reportsController = require(path.resolve('./modules/mago/server/controllers/reports.controller'));

var multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();


module.exports = function(app) {
    /* ====== for file upload ===== */
    app.route('/file-upload/single-file/:model/:field')
        .all(policy.isAllowed)
        .post(multipartyMiddleware, commonCtrl.upload_file);

    app.route('/file-upload/multi-file')
        .post(policy.isAllowed, multipartyMiddleware, commonCtrl.upload_multi_files);


    /*========== chart ============ */
    app.route('/api/dash/chart/salesreports')
      .all(policy.isAllowed)
      .get(dashboardController.chartSalesReport);

    app.route('/api/dash/chart/subsactive')
      .all(policy.isAllowed)
      .get(dashboardController.chartsSubsActive);

    app.route('/api/dash/chart/subexpire')
      .all(policy.isAllowed)
      .get(dashboardController.chartsSubsExpires);




    /* ===== Reports ===== */
    app.route('/api/reports/subscribers')
      .all(policy.isAllowed).get(reportsController.listOfSubscribers);
    app.route('/api/reports/sales')
      .all(policy.isAllowed).get(reportsController.listOfSales);
    app.route('/api/reports/expiring')
      .all(policy.isAllowed).get(reportsController.expiringNextWeek);
    app.route('/api/reports/product')
      .all(policy.isAllowed).get(reportsController.listSalesByProduct);
};
