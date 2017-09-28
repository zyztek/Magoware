'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    moment = require('moment'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.subscription,
    Combo = db.combo,
    LoginData = db.login_data,
    SalesData = db.salesreport;


/**
 * Create
 */
exports.create = function(req, res) {

  var newSub = req.body;

  // Validation of Input Fields
  if ((newSub.combo_id % 1 === 0) === false) { //check if it's integer
    return res.status(404).send({
      message: 'Combo ID is invalid'
    });
  }

  if ((newSub.login_id % 1 === 0) === false) { //check if it's integer
    return res.status(404).send({
      message: 'Login ID is invalid'
    });
  }

  // Loading Combo with All its packages
  Combo.findOne({
    where: {
      id: newSub.combo_id
    }, include: [{model:db.combo_packages,include:[db.package]}]
  }).then(function(combo) {
    if (!combo)
      return res.status(404).send({message: 'No Product with that identifier has been found'});
    else {
      // Load Customer by LoginID
      LoginData.findOne({
        where: {
          id: newSub.login_id
        }, include: [{model:db.customer_data},{model:db.subscription}]
      }).then(function(loginData) {
        if (!loginData) return res.status(404).send({message: 'No Login with that identifier has been found'});

        // Subscription Processing
        // For Each package in Combo
        combo.combo_packages.forEach(function(item,i,arr){
          var runningSub = hasPackage(item.package_id,loginData.subscriptions);
          var startDate = new Date(newSub.start_date);

          var sub = {
            login_id: loginData.id,
            package_id: item.package_id,
            customer_username: loginData.username,
            user_username: req.token.sub //live
          };

          if(typeof runningSub == 'undefined'){
            sub.start_date = startDate;
            sub.end_date =  addDays(sub.start_date, combo.duration);

            logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));
            // Saving Subscription
            DBModel.create(sub).then(function(savedSub) {
              if (!savedSub) return res.status(400).send({message: 'fail create data'});
            })
          }else{
            if(runningSub.end_date > startDate){
              runningSub.end_date = addDays(runningSub.end_date,combo.duration);
            }else{
              runningSub.start_date = startDate;
              runningSub.end_date = addDays(startDate,combo.duration);
            }

            // Saving into Database
            DBModel.update({
              start_date: runningSub.start_date,
              end_date: runningSub.end_date
            },{
              where:{
                id: runningSub.id
              }
            }).then(function(rSubResult){
              if (!rSubResult) return res.status(404).send({message: 'Error Updating Subscription'});
            });
          }
        });

        // Insert Into SalesData
        var sData = {
          user_id: req.token.uid,
          user_username: loginData.username,
          login_data_id: loginData.id,
          distributorname: req.token.sub,
          saledate: new Date(),
          combo_id: combo.id
        };
        SalesData.create(sData)
            .then(function(salesData){
              if (!salesData) return res.status(400).send({message: 'fail create sales data'});
            });


      });
      return res.jsonp({state:"ok",login_id:newSub.login_id});
    }
  });

  function hasPackage(package_id,subscription){
    for(var i=0;i<subscription.length;i++)
      if(subscription[i].package_id == package_id)
        return subscription[i];
  }

  function addDays(startdate, duration) {
    var start_date_ts = moment(startdate, "YYYY-MM-DD hh:mm:ss").valueOf()/1000; //convert start date to timestamp in seconds
    var end_date_ts = start_date_ts + duration * 86400; //add duration in number of seconds
    var end_date =  moment.unix(end_date_ts).format("YYYY-MM-DD hh:mm:ss"); // convert enddate from timestamp to datetime
    return end_date;
  }
};

/**
 * Show current
 */
exports.read = function(req, res) {
  res.json(req.subscription);
};

/**
 * Update
 */
exports.update = function(req, res) {
  var updateData = req.subscription;

  updateData.updateAttributes(req.body).then(function(result) {
    res.json(result);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete
 */
exports.delete = function(req, res) {
  var deleteData = req.subscription;

  DBModel.findById(deleteData.id).then(function(result) {
    if (result) {

      result.destroy().then(function() {
        return res.json(result);
      }).catch(function(err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      });
    } else {
      return res.status(400).send({
        message: 'Unable to find the Data'
      });
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });

};

/**
 * List
 */
exports.list = function(req, res) {

  var query = req.query;
  var offset_start = parseInt(query._start);
  var records_limit = query._end - query._start;
  var qwhere = {};
  var user_qwhere = {};
  if(query.login_id) qwhere.login_id = query.login_id;
  if(offset_start && records_limit){
    qwhere.offset = offset_start;
    qwhere.limit = records_limit;
  }

  if(query.q) {
    user_qwhere.$or = {};
    user_qwhere.$or.username = {};
    user_qwhere.$or.username.$like = '%'+query.q+'%';
  }

  DBModel.findAndCountAll({
    where: qwhere,
    order: 'login_id DESC',
    include: [{model:db.login_data, where: user_qwhere, required: true}, {model:db.package, required: true}]
  }).then(function(results) {
    if (!results) {
      return res.status(404).send({
        message: 'No data found'
      });
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
    where: {
      id: id
    },
    include: [{model: db.login_data}, {model: db.package}]
  }).then(function(result) {
    if (!result) {
      return res.status(404).send({
        message: 'No data with that identifier has been found'
      });
    } else {
      req.subscription = result;
      next();
      return null;
    }
  }).catch(function(err) {
    return next(err);
  });

};