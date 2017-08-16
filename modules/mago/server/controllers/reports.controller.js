/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    LoginData = db.login_data;
    Combo = db.combo;
    SalesReport = db.salesreport;

/**
 * List of Subscribers
 * */
exports.listOfSubscribers = function(req, res) {
    LoginData.findAll({
        include: [
            {model:db.customer_data},
            {model:db.subscription,
                order: [['end_date','ASC']],
                limit: 1
            }
        ]
    }).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {
            res.json(results);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

/**
 * List of Sales
 * */
exports.listOfSales = function(req, res) {
    SalesReport.findAll({
        include: [db.combo,db.users]
    }).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {
            res.json(results);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

/**
 * Expiring next week.
 * */
exports.expiringNextWeek = function(req, res) {
    LoginData.findAll({
        include:[
            {model: db.customer_data},
            {model:db.subscription, where:{end_date:{
                $between:[
                    new Date().getNextWeekMonday(),
                    new Date().getNextWeekSunday()
                ]
            }}}
        ]
    }).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {
            res.json(results);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

/**
 * Sales by product
 * */
exports.listSalesByProduct = function(req, res) {
    Combo.findAll({
        include: [db.salesreport]
    }).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {
            res.json(results);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

/**
 * Date Proto Functions, TODO: Move Later on
 * */

Date.prototype.getNextWeekMonday = function() {
    var d = new Date(this.getTime());
    var diff = d.getDate() - d.getDay() + 1;
    if (d.getDay() == 0)
        diff -= 7;
    diff += 7; // ugly hack to get next monday instead of current one
    return new Date(d.setDate(diff));
};

Date.prototype.getNextWeekSunday = function() {
    var d = this.getNextWeekMonday();
    return new Date(d.setDate(d.getDate() + 6));
};
