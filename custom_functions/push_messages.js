var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    request = require("request");

function send_notification(fcm_tokens, firebase_key, users, message, ttl, push_message, save_message, callback) {

    //push payload is the same inside this function call
    var payload = {
        "push_message": (push_message) ? "true" : "false",
        "EVENT": (push_message) ? message.event : "",
        "PROGRAM_ID": (push_message) ? message.program_id : "",
        "CHANNEL_NUMBER": (push_message) ? message.channel_number : "",
        "EVENT_TIME": (push_message) ? message.event_time : "",
        "program_name": (push_message) ? message.program_name : "",
        "program_description": (push_message) ? message.description : "",

        "COMMAND": (!push_message) ? message.command : "",
        "SOFTWARE_INSTALL": (!push_message) ? message.software_install : "",
        "DELETE_SHP": (!push_message) ? message.delete_shp : "",
        "DELETE_DATA": (!push_message) ? message.delete_data : ""
    };

    //push messages are sent one by one for each device token
    for(var i=0; i<fcm_tokens.length; i++){
        //prepare request
        var options = {
            url: 'https://fcm.googleapis.com/fcm/send',
            method: 'POST',
            headers: {
                'Authorization': "key="+firebase_key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "to": fcm_tokens[i],
                "data": payload
            })
        };
        request(options, function (error, response, body) {
            if(!error && JSON.parse(response.body).success === 1 && save_message === true){
                exports.save_message(users[0], fcm_tokens, message.description, push_message, message.description); //save record for sent message
            }
        });

    }

}


function save_message(users, googleappid, message, action, title){

    db.messages.create({
            username: users.login_datum.username,
            googleappid: users.googleappid,
            message: message,
            action: action,
            title: title
        },
        {
            logging: console.log
        }).then(function(result) {
        if (!result) {
            console.log('Fail to create data')
        } else {
            console.log('Messages saved')
        }
    }).catch(function(err) {
        console.log(err);
    });

}

exports.send_notification = send_notification;
exports.save_message = save_message;