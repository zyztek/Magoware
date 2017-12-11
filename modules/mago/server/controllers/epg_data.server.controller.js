'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    fileHandler = require(path.resolve('./modules/mago/server/controllers/common.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    fastcsv = require('fast-csv'),
    xml2js = require('xml2js'),
    async = require('async'),
    fs = require('fs'),
    moment = require('moment'),
    dateFormat = require('dateformat'),
    DBChannels = db.channels,
    DBModel = db.epg_data;

/**
 * Create
 */
exports.create = function(req, res) {

    DBModel.create(req.body).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail create data'});
        } else {
            return res.jsonp(result);
        }
    }).catch(function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * Create
 */
exports.epg_import = function(req, res) {

    var qwhere = {},
        final_where = {},
        query = req.query;

    if(query.q) {
        qwhere.$or = {};
        qwhere.$or.channel_number = {};
        qwhere.$or.channel_number.$like = '%'+query.q+'%';
        qwhere.$or.title = {};
        qwhere.$or.title.$like = '%'+query.q+'%';
        qwhere.$or.short_name = {};
        qwhere.$or.short_name.$like = '%'+query.q+'%';
        qwhere.$or.short_description = {};
        qwhere.$or.short_description.$like = '%'+query.q+'%';
        qwhere.$or.long_description = {};
        qwhere.$or.long_description.$like = '%'+query.q+'%';
    }


    //start building where
    final_where.where = qwhere;
    if(parseInt(query._start)) final_where.offset = parseInt(query._start);
    if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
    final_where.include = [];
    //end build final where


    DBModel.findAndCountAll(
        final_where
    ).then(function(results) {
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
 * Show current
 */
exports.read = function(req, res) {
    res.json(req.epgData);
};

/**
 * Update
 */
exports.update = function(req, res) {
    var updateData = req.epgData;

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
    var deleteData = req.epgData;

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
        return null;
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

    var qwhere = {},
        final_where = {},
        query = req.query;

    if(query.q) {
        qwhere.$or = {};
        qwhere.$or.channel_number = {};
        qwhere.$or.channel_number.$like = '%'+query.q+'%';
        qwhere.$or.title = {};
        qwhere.$or.title.$like = '%'+query.q+'%';
        qwhere.$or.short_name = {};
        qwhere.$or.short_name.$like = '%'+query.q+'%';
        qwhere.$or.short_description = {};
        qwhere.$or.short_description.$like = '%'+query.q+'%';
        qwhere.$or.long_description = {};
        qwhere.$or.long_description.$like = '%'+query.q+'%';
    }


    //start building where
    final_where.where = qwhere;
    if(parseInt(query._start)) final_where.offset = parseInt(query._start);
    if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
    final_where.include = [];
    //end build final where

    DBModel.findAndCountAll(
        final_where
    ).then(function(results) {
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

exports.list_chart_epg = function(req, res) {

    //get EPG data from last 7 days
    var d = new Date();
    d.setDate(d.getDate()-7);

    DBChannels.findAll({
        attributes: ['id', ['channel_number', 'group'],['program_start','start'],['program_end','end'],['title','content']],
        //limit: 100,
        where: {program_start: {gte: d}}
    }).then(function(channels){
        DBModel.findAll({
                attributes: ['id', ['channel_number', 'group'],['program_start','start'],['program_end','end'],['title','content']],
                //limit: 100,
                where: {program_start: {gte: d}}
            }
        ).then(function(results) {
            if (!results) {
                return res.status(404).send({
                    message: 'No data found'
                });
            } else {
                res.json({groups:channels, items:results});
            }
        }).catch(function(err) {
            res.jsonp(err);
        });
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
        include: []
    }).then(function(result) {
        if (!result) {
            return res.send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.epgData = result;
            next();
            return null;
        }
    }).catch(function(err) {
        return next(err);
    });

};

exports.save_epg_records = function(req, res){

    var current_time = dateFormat(Date.now(), "yyyy-mm-dd 00:00:00");

    if(req.body.delete_existing === true){
        DBModel.destroy({
            where: {id: {gt: -1}}
        }).then(function (result) {
            read_and_write_epg();
            return null;
        }).catch(function(error) {
            if(error.message.split(': ')[0] === 'ER_ROW_IS_REFERENCED_2') return res.status(400).send({message: 'Delete failed: At least one of these programs is scheduled'}); //referenced record cannot be deleted
            else return res.status(400).send({message: 'Unable to proceed with the action'}); //other error occurred
        });
    }
    else{
        read_and_write_epg(current_time);
    }

    function read_and_write_epg(current_time){
        if(fileHandler.get_extension(req.body.epg_file)=== '.csv'){
            import_csv(req, res, current_time);
        }
        else if(fileHandler.get_extension(req.body.epg_file)=== '.xml'){
            import_xml_standard(req, res, current_time); // xmlparser
        }
        else {
            return res.status(400).send({message: 'Incorrect file type'}); //serverside filetype validation
        }
    }

}


function import_xml_standard(req, res, current_time){
    var message = '';
    var parser = new xml2js.Parser(); // krijon parser
    var channel_list = new Array(); //associative array that will contain channel title, with id as identifier for the channels

    async.auto({
            //lexo file
            read_epg_file: function(callback){
                try{
                    fs.readFile(path.resolve('./public')+req.body.epg_file, function(err, data){
                        callback(null, data);
                    })
                }
                catch(error){
                    message = "Unable to read this file. Epg records were not saved";
                    callback(true);
                }
            },
            parse_epg_data: ['read_epg_file', function(result, callback){
                try{
                    parser.parseString(result.read_epg_file, function (err, epg_records) {
                        if(epg_records && epg_records.tv) {
                            console.log("---------------------------------------------- Epg records parsed, channels ", epg_records.tv.channel, "----------------------------------------------")
                            console.log("---------------------------------------------- Epg records parsed, programs ", epg_records.tv.programme, "----------------------------------------------")
                            callback(null, 1);
                        }
                        else {
                            message = "File was empty. Epg records were not saved";
                            callback(true);
                        }
                    })
                }
                catch(error){
                    console.log(error)
                    message = "Unable to parse the file content. Epg records were not saved";
                    callback(true);
                }
            }],
            //lexo listen e kanaleve
            read_channel_list: ['parse_epg_data', function(result, callback){
                //var channels = result.read_epg_file.tv.channel;
                console.log("The channel list ", result.read_epg_file);
                callback(null, 1)
            }],
            // bla bla bla
            insert_epg: ['read_channel_list', function(result, callback){
                callback(null, 1)
            }]
        },
        function(error, results) {
            if(error) {
                return res.status(400).send({message: message}); //serverside filetype validation
            }
            else return res.status(200).send({message: 'Epg records were saved'}); //serverside filetype validation
        });
}

function import_csv(req, res, current_time){
    var message = '';
    var channel_number_list = [];

    async.auto({
        get_channels: function(callback) {
            var channel_number_stream = fs.createReadStream(path.resolve('./public')+req.body.epg_file); //link main url
            fastcsv.fromStream(channel_number_stream, {headers : true}, {ignoreEmpty: true}).validate(function(data){
                if(req.body.channel_number){
                    return data.channel_number == req.body.channel_number;
                }
                else{
                    return data;
                }
            }).on("data", function(data){
                if(channel_number_list.indexOf(data.channel_number) === -1) {
                    channel_number_list.push(data.channel_number);
                }
            }).on("end", function(){
                callback(null);
            });
        },
        delete_epg: ['get_channels', function(results, callback) {
            if(channel_number_list.length < 1){
                message = 'Unable to read any records. Epg data not saved';
                callback(true);
            }
            else{
                DBModel.destroy({
                    where: {program_start: {gte: current_time}, channel_number: {in: channel_number_list}}
                }).then(function (result) {
                    callback(null, 1);
                }).catch(function(error) {
                    if(error.message.split(': ')[0] === 'ER_ROW_IS_REFERENCED_2') message = 'Delete failed: At least one of these programs is scheduled';
                    else message = 'Unable to proceed with the action';
                    callback(true);
                });
            }
        }],
        save_epg: ['delete_epg', function(epg_data, callback) {
            var stream = fs.createReadStream(path.resolve('./public')+req.body.epg_file); //link main url
            fastcsv.fromStream(stream, {headers : true}, {ignoreEmpty: true}).validate(function(data){
                if(req.body.channel_number){
                    return data.channel_number == req.body.channel_number;
                }
                else return data;
            }).on("data", function(data){
                DBModel.create({
                    channels_id: data.channel_id,
                    channel_number: data.channel_number,
                    title: data.title,
                    short_name: data.short_name,
                    short_description: data.short_description,
                    program_start: data.program_start,
                    program_end: data.program_end,
                    long_description: data.long_description,
                    duration_seconds: (Date.parse(data.program_end) - Date.parse(data.program_start))/1000 //parse strings as date timestamps, convert difference from milliseconds to seconds
                }).then(function (result) {
                }).catch(function(error) {
                    message = 'Unable to save some epg records';
                });
            }).on("end", function(){
                callback(null);
            });
        }],
    }, function(error, results) {
        if(error) {
            return res.status(400).send({message: message}); //serverside filetype validation
        }
        else return res.status(200).send({message: 'Epg records were saved'}); //serverside filetype validation
    });

}

function import_xml_dga(req, res){
    try{
        var parser = new xml2js.Parser();
        fs.readFile(path.resolve('./public'+req.body.epg_file), function(err, data) {
            parser.parseString(data, function (err, result) {
                var all_programs = result.WIDECAST_DVB.channel; //all programs of all channels
                // iterate over each channel
                all_programs.forEach(function(channels){
                    var channel_name = channels.$.name;
                    //find channel id and number
                    db.channels.findOne({
                        attributes: ['channel_number', 'id'],
                        where: {title: channel_name}
                    }).then(function (channel_data) {
                        //iterate over all events of this channel
                        channels.event.forEach(function(events){
                            db.epg_data.create({
                                channels_id: channel_data.id, //ok
                                channel_number: channel_data.channel_number, //ok
                                title: channel_name, //ok
                                short_name: events.short_event_descriptor[0].$.name,
                                short_description: events.short_event_descriptor[0]._,
                                program_start: events.$.start_time,
                                program_end: moment.unix(parseInt(moment(events.$.start_time).format('X')) + parseInt(events.$.duration)).format('YYYY-MM-DD hh:mm:ss') , // ok
                                long_description: events.extended_event_descriptor[0].text[0],
                                duration_seconds: events.$.duration //is in seconds
                            }).then(function (result) {
                                return res.status(200).send({message: 'Epg records saved'});
                            }).catch(function(error) {
                                return res.status(400).send({message: 'Unable to save the epg records'});
                            });
                        });
                        return null;
                    }).catch(function(error) {
                        console.log(error)
                    });
                });
            });
            if(err) console.log(err)
        });
    }
    catch(error){
        console.log(error)
    }
}

function stringtodate(date){
    return date.substring(0,4)+'-'+date.substring(4,6)+'-'+date.substring(6,8)+' '+date.substring(8,10)+':'+date.substring(10,12)+':'+date.substring(12, 14);
}
function datetimediff_seconds(start, end){
    return parseInt(moment(end).format('X')) - parseInt(moment(start).format('X')); //format('X') makes sure timestamps are in seconds
}