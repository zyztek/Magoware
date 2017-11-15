//'use strict'
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    model = db.model,
    response = require(path.resolve("./config/responses.js")),
    models = db.models,
    dateFormat = require('dateformat'),
    push_msg = require(path.resolve('./custom_functions/push_messages')),
    scheduled_tasks = [];

function schedule_program(event_time, firebase_key, event_id, login_data_id, channel_number, program_id){
    try{
        scheduled_tasks[event_id] = setTimeout(function(){
            send_notification(event_time, firebase_key, login_data_id, channel_number, program_id)
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

function send_notification(event_time, firebase_key, login_data_id, channel_number, program_id){
    models.devices.findAll({
        attributes: ['googleappid'],
        where: {login_data_id: login_data_id, device_active: true},
        include: [{model: models.login_data, attributes: ['username'], required: true}]
    }).then(function(devices) {
        if(!devices || devices.length < 0){

        }
        else{
            models.epg_data.findOne({
                attributes: ['id', 'channel_number', 'program_start', 'title', 'long_description'],
                where: {id: program_id},
                logging: console.log
            }).then(function (epg_program) {
                if(!epg_program || epg_program.length<0){
                    console.log("jo epg ose epg length 0")
                }
                else{
                    //todo: prepare payload                                                      ----
                    var fcm_tokens = [];
                    for(var i=0; i<devices.length; i++){
                        fcm_tokens.push(devices[i].googleappid);
                    }
                    var message = {
                        "event": "scheduling",
                        "program_id": program_id.toString(),
                        "channel_number": channel_number.toString(),
                        "event_time": event_time.toString(),
                        "program_name": epg_program.title,
                        "description": epg_program.long_description
                    };
                    push_msg.send_notification(fcm_tokens, firebase_key, devices[0].login_datum.username, message, 0, true, false, 0); //todo: 0 e fundit ishte callback ...
                }
            }).catch(function(error) {
                console.log(error)
            });
            return null;
        }
        return null;
    }).catch(function(error) {
        console.log(error)
    });


}

exports.reload_scheduled_programs = function() {
    console.log("tek reschedule")
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