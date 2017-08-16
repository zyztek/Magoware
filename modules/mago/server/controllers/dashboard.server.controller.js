'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    moment = require('moment'),
    db = require(path.resolve('./config/lib/sequelize'));

//todo: convert queries to sequelize?

exports.chartSalesReport = function(req, res) {
    db.sequelize.query(
        "SELECT COUNT(1) as 'count',DATE(DATE_FORMAT(saledate,'%Y-%m-%d')) as 'date' "+
        "FROM salesreport "+
        "WHERE saledate >= DATE_SUB(NOW(), INTERVAL 30 DAY) "+
        "GROUP BY DATE_FORMAT(saledate,'%Y-%m-%d')",
        { type: db.sequelize.QueryTypes.SELECT})
        .then(function(result){
            if (!result) {
                return res.status(400).send({message: 'fail get data'});
            } else {
                var resArr = [];
                result.forEach(function(item,i,arr){
                    var itemArr = [item.date.getTime(),item.count];
                    resArr.push(itemArr)
                });
                return res.jsonp(resArr);
            }
        });
};

exports.chartsSubsExpires = function(req, res) {
    db.sequelize.query(
        "SELECT count(DISTINCT login_id) as 'count', MAX(end_date) as 'date' "+
        "FROM subscription "+
        "WHERE end_date<=DATE_ADD(NOW(), INTERVAL 30 DAY) AND end_date>=now()",
        { type: db.sequelize.QueryTypes.SELECT})
        .then(function(result){
            if (!result) {
                return res.status(400).send({message: 'fail get data'});
            } else {
                var resArr = [];
                result.forEach(function(item,i,arr){
                    if(item.count>0) {
                        var itemArr = [item.date.getTime(), item.count];
                        resArr.push(itemArr)
                    }
                });
                return res.jsonp(resArr);
            }
        });
};

exports.chartsSubsActive = function(req, res) {
    db.sequelize.query(
            "SELECT count(DISTINCT login_id) as 'count', MAX(end_date) as 'date' "+
            "FROM subscription "+
            "WHERE end_date>=now()",
        { type: db.sequelize.QueryTypes.SELECT})
        .then(function(result){
            if (!result) {
                return res.status(400).send({message: 'fail get data'});
            } else {
                var resArr = [];
                result.forEach(function(item,i,arr){
                    if(item.count>0) {
                        var itemArr = [item.date.getTime(), item.count];
                        resArr.push(itemArr)
                    }
                });
                return res.jsonp(resArr);
            }
        });
};

exports.chartsgraph1 = function(req, res) {

    var sampledata = [];
    var d = new Date(); // Today!
    d.setDate(d.getDate() - 30); // last 30 days.

    var thequery = "select saledate as label, count(id) as value from salesreport WHERE saledate > '" + moment(d).format('YYYY-MM-DD hh:mm:ss') + "' group by label order by label asc ";
    db.sequelize.query(
        thequery,
        { type: db.sequelize.QueryTypes.SELECT})
        .then(function(result){
            if (!result) {
                return res.status(400).send({message: 'fail get data'});
            } else {
                var alldata = [];
                    alldata[0] = {};
                    alldata[0].key = 'sales';
                    alldata[0].values = result;
                return res.send({mydata: alldata});
            }
        });
};

exports.chart_vis_sales = function(req, res) {

    var sampledata = [];
    var d = new Date(); // Today!
    d.setDate(d.getDate() - 90); // last 30 days.

    var thequery = "select DATE_FORMAT(saledate,'%Y-%m-%d') as x, count(id) as y from salesreport WHERE saledate > '" + moment(d).format('YYYY-MM-DD hh:mm:ss') + "' group by x order by y asc ";
    db.sequelize.query(
        thequery,
        { type: db.sequelize.QueryTypes.SELECT})
        .then(function(result){
            if (!result) {
                return res.status(400).send({message: 'fail get data'});
            } else {
                var alldata = [];
                alldata[0] = {};
                alldata[0].key = 'sales';
                alldata[0].values = result;
                console.log(result);
                return res.send({results: result});
            }
        });
};

exports.chartsgraph2 = function(req, res) {
    db.sequelize.query(
            "SELECT  Count(salesreport.id), salesreport.combo_id, salesreport.saledate FROM salesreport GROUP BY " +
                "salesreport.combo_id, salesreport.saledate",
        { type: db.sequelize.QueryTypes.SELECT})
        .then(function(results){
            res.json(results);

        });
};

exports.salespiechart = function(req, res) {
    db.sequelize.query("SELECT combo.`name` as 'key', Count(salesreport.id) as y FROM combo INNER JOIN salesreport ON salesreport.combo_id = combo.id GROUP BY combo.`name`",
        { type: db.sequelize.QueryTypes.SELECT})
        .then(function(result){
            if (!result) {
                return res.status(400).send({message: 'fail get data'});
            } else {
                return res.json({mydata: result});
            }
        });
};

exports.salesbyproduct = function(req, res) {
    db.sequelize.query("SELECT salesreport.saledate as 'key', Count(salesreport.id) as y FROM salesreport GROUP BY salesreport.saledate",
        { type: db.sequelize.QueryTypes.SELECT})
        .then(function(result){
            if (!result) {
                return res.status(400).send({message: 'fail get data'});
            } else {
                var alldata = [];
                alldata[0] = {};
                alldata[0].key = 'sales by product';
                alldata[0].values = _.mapValues(result, _.partial(_.map, _, _.values)); //,[function(o) { return o.key; }]); //_.map(result, 'y');
                return res.json({mydata: alldata});
            }
        });
};