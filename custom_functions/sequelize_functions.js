var sequelize = require('sequelize');

function timediff(start, end, name, unit){
    return [sequelize.fn('TIMESTAMPDIFF', sequelize.literal(unit), sequelize.col(start), sequelize.col(end)), name];
}

function final_time(datetime, name, unit, value, format){
    return  [sequelize.fn('DATE_FORMAT', sequelize.fn('DATE_ADD', sequelize.col(datetime), sequelize.literal('INTERVAL '+value+' '+unit+'')), format), name];
}

function epg_progress(start, end, name){
    var time_passed = sequelize.fn('TIMESTAMPDIFF', sequelize.literal('SECOND'), sequelize.col(start), sequelize.literal('NOW()'));
    var duration = sequelize.fn('TIMESTAMPDIFF', sequelize.literal('SECOND'), sequelize.col(start), sequelize.col(end));
    return [time_passed, name];
}

function epg_progressi(start, end, name){
    return [sequelize.fn('IF', sequelize.col(start), sequelize.literal('NOW()'), sequelize.literal('start>now'), sequelize.literal('start<now')), name];

}

function add_constant(value, name){
    return [sequelize.literal("'"+value+"'"), name];
}

function to_upper(value, name){
    return [sequelize.fn('upper', Sequelize.col('title')), name];
}

exports.timediff = timediff;
exports.final_time = final_time;
exports.epg_progress = epg_progress;
exports.add_constant = add_constant;
exports.to_upper = to_upper;

exports.epg_progressi = epg_progressi;