var path = require('path'),
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

exports.add_subscription = add_subscription;