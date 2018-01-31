var path = require('path'),
    crypto = require("crypto"),
    sequelize_t = require(path.resolve('./config/lib/sequelize')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    subscription = db.subscription,
    dateFormat = require('dateformat'),
    moment = require('moment'),
    response = require(path.resolve("./config/responses.js"));

function add_subscription(req, res, login_id, combo_id, username){
    db.combo.findAll({
        attributes: ['id', 'duration'],where: {id: combo_id},
        include:[{
            model: db.combo_packages, required: true, attributes: ['package_id'], include: [{
                model: db.package, required: true, attributes: ['id'], include: [{
                    model: db.subscription, required: false, attributes: ['start_date', 'end_date'], where: {login_id: login_id}
                }]
            }]
        }]
    }).then(function(current_subscription){
        if(current_subscription.length < 1){
            var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
            clear_response.extra_data = "This product is empty";
            res.send(clear_response);
        }
        else{
            for(var i = 0; i<current_subscription.length; i++){
                if(current_subscription[0].combo_packages[0].package.subscriptions[0]){
                    var startdate = current_subscription[0].combo_packages[0].package.subscriptions[0].start_date;
                    var enddate = moment(current_subscription[0].combo_packages[0].package.subscriptions[0].end_date, 'YYYY-MM-DD hh:mm:ss').add(current_subscription[0].duration, 'day');
                }
                else{
                    var startdate = dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss');
                    var enddate = dateFormat(Date.now() + current_subscription[0].duration*86400000, 'yyyy-mm-dd HH:MM:ss');
                }
                db.subscription.upsert({
                    login_id:            login_id,
                    package_id:          current_subscription[0].combo_packages[0].package_id,
                    customer_username:   username,
                    user_username:       '',
                    start_date:          startdate,
                    end_date:            enddate
                }).then(function(result){
                    db.salesreport.create({
                        user_id:            1,
                        combo_id:           combo_id,
                        login_data_id:      login_id,
                        user_username:      username,
                        distributorname:    '',
                        saledate:           dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss')
                    }).then(function(result){
                        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
                        res.send(clear_response);
                    }).catch(function(error){
                        console.log(error);
                    });
                    return null;
                }).catch(function(error){
                    console.log(error);
                });
                return null;
            }
        }
    }).catch(function(error){
        console.log(error);
    });
}

//add subscription to user
exports.add_subscription_transaction = function(req,res,sale_or_refund,transaction_id,start_date) {

    var transactions_array = [];


    if(!sale_or_refund) sale_or_refund = 1;
    if(!transaction_id) transaction_id = crypto.randomBytes(16).toString('base64');
    if(typeof start_date == 'undefined') start_date = Date.now(); //

    // Loading Combo with All its packages
    return db.combo.findOne({
        where: {
            id: req.body.product_id,
            isavailable: true
        }, include: [{model:db.combo_packages,include:[db.package]}]
    }).then(function(combo) {
        if (!combo)return {status: false, message: 'no combo found'}; //no combo found
        else {
            // Load Customer by LoginID
            return db.login_data.findOne({
                where: {
                    $or: {
                        username: req.body.username,
                        id: req.body.login_data_id
                    }
                }, include: [{model: db.customer_data}, {model: db.subscription}]
            }).then(function (loginData) {
                if (!loginData) return {status: false, message: 'no user found'}; //no username found

                return sequelize_t.sequelize.transaction(function (t) {
                    combo.combo_packages.forEach(function (item, i, arr) {
                        var runningSub = hasPackage(item.package_id, loginData.subscriptions);
                        var startDate = new Date(start_date);

                        var sub = {
                            login_id: loginData.id,
                            package_id: item.package_id,
                            customer_username: loginData.username,
                            user_username: 'api user' //req.token.sub //live
                        };

                        if (typeof runningSub == 'undefined') {
                            sub.start_date = startDate;
                            sub.end_date = addDays(sub.start_date, combo.duration * sale_or_refund);

                            transactions_array.push(
                                db.subscription.create(sub, {transaction: t}) //add insert to transaction array
                            )
                        } else {
                            if (runningSub.end_date > startDate) {
                                runningSub.end_date = addDays(runningSub.end_date, combo.duration * sale_or_refund);
                            } else {
                                runningSub.start_date = startDate;
                                runningSub.end_date = addDays(startDate, combo.duration * sale_or_refund);
                            }

                            transactions_array.push(    //add update to transaction array
                                db.subscription.update(runningSub.dataValues, {
                                    where: {id: runningSub.id},
                                    transaction: t
                                })
                            );
                        }
                    });//end package loop

                    if(sale_or_refund) console.log('sale ore refund',sale_or_refund);

                    var salesreportdata = {
                        transaction_id: transaction_id,
                        user_id : 1,
                        distributorname: 1,
                        combo_id: req.body.product_id,
                        login_data_id: loginData.id,
                        user_username: loginData.id,
                        saledate: Date.now(),
                        active:sale_or_refund
                    };

                    if(sale_or_refund == 1) {
                        transactions_array.push(
                            db.salesreport.create(salesreportdata, {transaction: t}) //add insert to transaction array
                        );
                    }
                    else {
                        transactions_array.push(
                            db.salesreport.update(salesreportdata,
                                {where: {transaction_id: transaction_id}
                                    , transaction: t}) //add insert to transaction array
                        );
                    }

                    return Promise.all(transactions_array, {transaction:t}); //execute transaction

                }).then(function (result) {
                    return {status: true,message:'subscription executed correctly'};
                }).catch(function (err) {
                    console.log(err);
                    return {status: false,message:'error executing transaction'};
                })
            });
        } //end if combo found
    });//end combo search

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
}

exports.add_subscription = add_subscription;
