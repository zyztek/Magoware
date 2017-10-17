'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    sequelize = require('sequelize'),
    dateFormat = require('dateformat'),
    DBModel = db.salesreport;

/**
 * Create
 */
exports.create = function(req, res) {

    DBModel.create(req.body).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail create data'});
        }
        else {
            return res.jsonp(result);
        }
    }).catch(function(err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    });
};

/**
 * Show current
 */
exports.read = function(req, res) {
    res.json(req.salesReport);
};

/**
 * Update
 */
exports.update = function(req, res) {
    var updateData = req.salesReport;

    updateData.updateAttributes(req.body).then(function(result) {
        res.json(result);
    }).catch(function(err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    });

};

exports.annul = function(req, res) {
    return res.status(200).send({ message: "Now we are annuling combo" });
};

/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.salesReport;

    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {
            result.destroy().then(function() {
                return res.json(result);
            }).catch(function(err) {
                return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
            });
        } else {
            return res.status(400).send({
                message: 'Unable to find the Data'
            });
        }
    }).catch(function(err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    });
};

/**
 * List
 */
exports.list = function(req, res) {
    //if a filter is left empty, query searches for like '%%' in case of strings and interval [0 - 3000] years for dates, ignoring the filter

    var qwhere = {},
        final_where = {},
        query = req.query;
    final_where.where = qwhere; //start building where

    if(req.query.user_username) final_where.where.user_username = {like: '%'+req.query.user_username+'%'};
    if(query.login_data_id) final_where.where.login_data_id = query.login_data_id;
    if(req.query.distributorname) final_where.where.distributorname = {like: '%'+req.query.distributorname+'%'};

    if(req.query.name) final_where.where.combo_id = req.query.name;

    if(req.query.startsaledate) final_where.where.saledate = {gte:req.query.startsaledate};
    if(req.query.endsaledate) final_where.where.saledate = {lte:req.query.endsaledate};

    if((req.query.startsaledate) && (req.query.endsaledate)) final_where.where.saledate = {gte:req.query.startsaledate,lte:req.query.endsaledate};

    //fetch records for specified page
    if(parseInt(query._start)) final_where.offset = parseInt(query._start);
    if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);

    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir; //sort by specified field and specified order

    DBModel.findAndCountAll(
        final_where
    ).then(function(results) {
        if (!results) {
            return res.status(404).send({ message: 'No data found' });
        } else {
            res.setHeader("X-Total-Count", results.count);
            res.json(results.rows);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });

};

exports.sales_by_product = function(req, res) {
    //if a filter is left empty, query searches for like '%%' in case of strings and interval [0 - 3000] years for dates, ignoring the filter
    console.log("-------------------------- sales_by_product ----------------------------")

    var qwhere = {},
        final_where = {},
        query = req.query;
    final_where.where = qwhere; //start building where

    if(req.query.name) final_where.where.combo_id = req.query.name;

    if(req.query.startsaledate) final_where.where.saledate = {gte:req.query.startsaledate};
    if(req.query.endsaledate) final_where.where.saledate = {lte:req.query.endsaledate};

    if((req.query.startsaledate) && (req.query.endsaledate)) final_where.where.saledate = {gte:req.query.startsaledate,lte:req.query.endsaledate};

    //fetch records for specified page
    if(parseInt(query._start)) final_where.offset = parseInt(query._start);
    if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);

    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir; //sort by specified field and specified order

    final_where.attributes = ['id', 'combo_id', [sequelize.fn('max', sequelize.col('saledate')), 'saledate'], 'createdAt', [sequelize.fn('count', sequelize.col('combo_id')), 'count']];
    final_where.group = ['combo_id'];


    DBModel.findAndCountAll(
        final_where
    ).then(function(results) {
        if (!results) {
            return res.status(404).send({ message: 'No data found' });
        } else {
            res.setHeader("X-Total-Count", results.count.length);
            res.json(results.rows);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });

};

exports.sales_by_date = function(req, res) {
    console.log("-------------------------- sales_by_date ----------------------------")


    var qwhere = {},
        final_where = {},
        query = req.query;
    final_where.where = qwhere; //start building where

    if(req.query.user_username) final_where.where.user_username = {like: '%'+req.query.user_username+'%'};
    if(query.login_data_id) final_where.where.login_data_id = query.login_data_id;
    if(req.query.distributorname) final_where.where.distributorname = {like: '%'+req.query.distributorname+'%'};

    if(req.query.name) final_where.where.combo_id = req.query.name;

    //if(req.query.startsaledate || req.query.endsaledate)
    //    final_where.where.saledate = {between: [(req.query.startsaledate) ? req.query.startsaledate : '0000-00-00', (req.query.endsaledate) ? req.query.endsaledate : '3000-00-00']}
    if(req.query.startsaledate) final_where.where.saledate = {gte:req.query.startsaledate};
    if(req.query.endsaledate) final_where.where.saledate = {lte:req.query.endsaledate};

    if((req.query.startsaledate) && (req.query.endsaledate)) final_where.where.saledate = {gte:req.query.startsaledate,lte:req.query.endsaledate};

    //fetch records for specified page

    if(parseInt(query._start)) final_where.offset = parseInt(query._start);
    if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);

    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir; //sort by specified field and specified order

    final_where.attributes = ['id', 'saledate', [sequelize.fn('count', sequelize.col('saledate')), 'count']];
    final_where.group = [sequelize.fn('DATE', sequelize.col('saledate'))]; //group by date of sale (excluding time information)

    final_where.include = [{model: db.combo, required: true, attributes: [[sequelize.fn('sum', sequelize.col('value')), 'total_value']]}];

    DBModel.findAndCountAll(
        final_where
    ).then(function(results) {
        if (!results) {
            return res.status(404).send({ message: 'No data found' });
        } else {
            res.setHeader("X-Total-Count", results.count.length);
            res.json(results.rows);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });

};

exports.sales_by_month = function(req, res) {
    console.log("-------------------------- sales_by_month ----------------------------")

    var qwhere = {},
        final_where = {},
        query = req.query;
    final_where.where = qwhere; //start building where

    if(req.query.user_username) final_where.where.user_username = {like: '%'+req.query.user_username+'%'};
    if(query.login_data_id) final_where.where.login_data_id = query.login_data_id;
    if(req.query.distributorname) final_where.where.distributorname = {like: '%'+req.query.distributorname+'%'};

    if(req.query.name) final_where.where.combo_id = req.query.name;

    if(req.query.startsaledate) final_where.where.saledate = {gte:req.query.startsaledate};
    if(req.query.endsaledate) final_where.where.saledate = {lte:req.query.endsaledate};

    if((req.query.startsaledate) && (req.query.endsaledate)) final_where.where.saledate = {gte:req.query.startsaledate,lte:req.query.endsaledate};

    //fetch records for specified page
    if(parseInt(query._start)) final_where.offset = parseInt(query._start);
    if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);

    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir; //sort by specified field and specified order

    final_where.attributes = ['id', 'saledate', [sequelize.fn('count', sequelize.col('saledate')), 'count']];
    final_where.group = [sequelize.fn('DATE_FORMAT', sequelize.col('saledate'), "%Y-%m-01")]; //group by month/year of sale (excluding day and time information)

    final_where.include = [{model: db.combo, required: true, attributes: [
        [sequelize.fn('sum', sequelize.col('value')), 'total_value']]}];

    DBModel.findAndCountAll(
        final_where
    ).then(function(results) {
        if (!results) {
            return res.status(404).send({ message: 'No data found' });
        } else {
            res.setHeader("X-Total-Count", results.count.length);
            res.json(results.rows);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });

};

exports.sales_by_expiration = function(req, res) {
    var qwhere = {},
        final_where = {},
        query = req.query;
    final_where.where = qwhere; //start building where

    if(req.query.login_id) final_where.where.login_id = {like: '%'+req.query.login_id+'%'};
    if(query.login_data_id) final_where.where.login_data_id = query.login_data_id;
    if(req.query.distributorname) final_where.where.distributorname = {like: '%'+req.query.distributorname+'%'};

    if(req.query.name) final_where.where.combo_id = req.query.name;

    var start = (req.query.startsaledate) ? (req.query.startsaledate+' 00:00:00') : sequelize.literal('NOW()');
    if(req.query.endsaledate) var end = req.query.endsaledate;
    final_where.where = (end) ? {end_date: {between: [start, end]}} : {end_date: {gte: start}};

    if(parseInt(query._start)) final_where.offset = parseInt(query._start);
    if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);

    final_where.attributes = ['id', 'login_id', [sequelize.fn('max', sequelize.col('end_date')), 'end_date']];
    final_where.group = ['login_id'];

    db.subscription.findAndCountAll(
        final_where
    ).then(function(results) {
        if (!results) {
            return res.status(404).send({ message: 'No data found' });
        } else {
            res.setHeader("X-Total-Count", results.count.length);
            res.json(results.rows);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });

};

/**
 * Lastest
 */
exports.latest = function(req, res) {

    DBModel.findAndCountAll({
        offset: offset_start,
        limit: records_limit,
        include: [db.combo, db.users],
        order: [['createdAt','ASC']]
    }).then(function(results) {
        if (!results) {
            return res.status(404).send({ message: 'No data found' });
        } else {
            res.setHeader("X-Total-Count", results.count);
            res.json(results.rows);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

/**
 * middleware
 */

exports.dataByID = function(req, res, next, id) {

    if ((id % 1 === 0) === false) { //check if it's integer
        return res.status(404).send({
            message: 'Data is invalid'
        });
    }

    DBModel.find({
        where: { id: id },
        include: [{model: db.combo}, {model: db.users}]
    }).then(function(result) {
        if (!result) {
            return res.status(404).send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.salesReport = result;
            next();
        }
    }).catch(function(err) {
        return next(err);
    });

};