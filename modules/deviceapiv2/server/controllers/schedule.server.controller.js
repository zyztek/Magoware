//'use strict'
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    response = require(path.resolve("./config/responses.js")),
    models = db.models,
    dateFormat = require('dateformat'),
    gcm = require('node-gcm'), //for android push messages
    apn = require('apn'), //for ios push messages
    scheduled_tasks = [];

function schedule_program(event_time, event_id, login_data_id, channel_number, program_id){
    console.log("event_time -------> "+ event_time)
    console.log("event_id -------> "+ event_id)
    console.log("login_data_id -------> "+ login_data_id)
    console.log("channel_number -------> "+ channel_number)
    console.log("program_id -------> "+ program_id)

    try{
        //scheduled_tasks[event_id] = setTimeout(send_notification, event_time); //this is how it will work, plus arguments
        console.log("scheduled with success")
        scheduled_tasks[event_id] = setTimeout(function(){
            send_notification(event_time, login_data_id, channel_number, program_id)
        }, event_time);
    }
    catch(e){
        console.log(e)
    }
}

function unschedule_program(event_id){
    clearTimeout(scheduled_tasks[event_id]);
    delete scheduled_tasks[event_id];
}

function send_notification(event_time, login_data_id, channel_number, program_id){
    console.log("mustwatchthisprogram")
    models.devices.findAll({
        attributes: ['googleappid', 'appid'],
        where: {login_data_id: login_data_id, device_active: true}
    }).then(function(result) {
        models.epg_data.findOne({
            attributes: ['id', 'channel_number', 'program_start', 'title', 'long_description'],
            where: {id: program_id},
            logging: console.log
        }).then(function (epg_program) {
            console.log("@result")
            var data = {
                "title": 'Scheduled program',
                "body": "Scheduled program, channel "+channel_number
            };
            if (!result) {
                console.log("@notresult");
            } else {
                for (var j = 0; j < result.length; j++) {
                    //start dergimi
                    if(result[j].appid == 1 || result[j].appid == 2 || result[j].appid == 4) {
                        try{
                            var data = {
                                "CLIENT_MESSAGE": 'Scheduled program',
                                "EVENT": 'scheduling',
                                "PROGRAM_ID": program_id,
                                "CHANNEL_NUMBER": channel_number,
                                "EVENT_TIME": event_time,
                                "program_name": epg_program.title,
                                "program_description": epg_program.long_description
                            };
                            send_android_notifications(result[j].googleappid, data);
                        } catch(error){
                            console.log("error while calling function")
                            console.log(error)
                        }
                    }
                    if(result[j].appid == 3) {
                        send_ios_notifications(result[j].googleappid,data, channel_number, epg_program)
                    }
                    //mbaron dergimi
                }
            }
            return null;
        }).catch(function(error) {
            console.log(error)
        });
        return null;
    }).catch(function(error) {
        console.log(error)
    });


}

function send_android_notifications(google_app_id, data){

    var sender = new gcm.Sender('AIzaSyDegTDot6Ked4cbTLF_TpQH6ZP2zNqgQ0o');
    var registrationIds = [google_app_id];
    var message = new gcm.Message({
        data: data
    });

    try{
        sender.send(message, registrationIds, function (err, result) {
            if(result) console.log(result);
            if(err) console.log(err)
        });
    }
    catch(error){
        //todo: do sth in case sending failed
    }

}

function send_ios_notifications(google_app_id, data, channel_number, epg_program){
    console.log("@ios function")
    // Set up apn with the APNs Auth Key
    var apnProvider = new apn.Provider({
        token: {
            key: path.resolve('config/sslcertificate/IOS_APNs_82X366YY8N.p8'), // Path to the key p8 file, //IOS_APNs_82X366YY8N.p8  , //p12ioscert.p12
            keyId: '82X366YY8N', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
            teamId: 'RY4R7JL9MP', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
        },
        production: true // Set to true if sending a notification to a production iOS app
    });

    var deviceToken = google_app_id; // device token
    var notification = new apn.Notification(); // Prepare a new notification
    notification.topic = 'com.magoware.webtv'; // Specify your iOS app's Bundle ID (accessible within the project editor)
    notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Set expiration to 1 hour from now (in case device is offline)
    notification.badge = 1; // Set app badge indicator
    notification.sound = 'ping.aiff'; // Play ping.aiff sound when the notification is received
    notification.alert = data; // Display the following message (the actual notification text, supports emoji)
    notification.payload = {details: {
        'action': 'scheduled',
        'channel_number': channel_number,
        "CLIENT_MESSAGE": 'Scheduled program',
        "program_name": epg_program.title,
        "program_description": epg_program.long_description
    }}; // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification

    console.log(notification)
    // Actually send the notification
    apnProvider.send(notification, deviceToken).then(function(err, result) {
        // Check the result for any failed devices
        if(result) console.log(result);
        if(err) {
            console.log("@ios error")
            console.log(err)
        }
    });

}

exports.reload_scheduled_programs = function() {
    var now = new Date();
    var current_time = dateFormat(now.setMinutes(now.getMinutes() + 5), "yyyy-mm-dd HH:MM:ss");

    models.epg_data.findAll({
        attributes: ['channel_number', 'program_start'],
        include: [{ model: models.program_schedule, required: true, attributes: ['id', 'login_id', 'program_id']}],
        where: {program_start: {gte: current_time}}
    }).then(function(result){
        //foreach record call schedule program
        for(var i = 0; i<result.length; i++){
            schedule_program(result[i].program_start.getTime() - Date.now() - 300000, result[i].program_schedules[0].id, result[i].program_schedules[0].login_id, result[i].channel_number, result[i].program_schedules[0].program_id);
        }
    }).catch(function(error){
        console.log(error)
    });
}

//checks if there is a stored push event in local memory
exports.is_scheduled = function(event_id){
    if(!scheduled_tasks[event_id]) return false;
    else return true;
};

exports.schedule_program = schedule_program;
exports.unschedule_program = unschedule_program;