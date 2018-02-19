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
    var past = new Date();
    var future = new Date();
    past.setDate(past.getDate()-4);
    future.setDate(future.getDate()+7);

    DBChannels.findAll({
        attributes: ['id', ['channel_number', 'group'],['title','content']],
        //limit: 100,
        //where: {program_start: {gte: d}}
    }).then(function(channels){
        DBModel.findAll({
                attributes: ['id', ['channel_number', 'group'],['program_start','start'],['program_end','end'],['title','content']],
                //limit: 100,
                where: {program_start: {gte: past}, program_end :{lte: future}}
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

    var current_time = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
    req.body.timezone = (req.body.timezone && (-12 < req.body.timezone < 12) ) ? req.body.timezone : 0; //valid timezone input or default timezone 0
    req.body.encoding = (req.body.encoding && (['ascii', 'utf-8', 'latin1', ].indexOf(req.body.encoding) !== -1) ) ? req.body.encoding : 'utf-8'; //valid encoding input or default encoding utf-8

    if(req.body.delete_existing === true){
        DBModel.destroy({
            where: {id: {gt: -1}}
        }).then(function (result) {
            read_and_write_epg(current_time);
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
    var channel_list = new Array(); //associative array to contain title, with id as identifier for the channels
    try{
        var parser = new xml2js.Parser();
        fs.readFile(path.resolve('./public')+req.body.epg_file, req.body.encoding, function(err, data) {
            parser.parseString(data, function (err, result) {
                try{
                    var channels = result.tv.channel; //stores all channel records
                    var programs = result.tv.programme; //stores all programs of all channels
                    if(result.tv.channel != undefined && result.tv.programme != undefined){
                        //channel and event data were not null / undefined
                        async.auto({
                            delete_existing_epg: function(callback) {
                                async.forEach(channels, function (channel, callback) {
                                    var filtered_channel_number = (req.body.channel_number) ? req.body.channel_number : {gte: -1};
                                    db.channels.findOne({
                                        attributes: ['channel_number'], where: {title: channel["display-name"], channel_number: filtered_channel_number}
                                    }).then(function (ch_result) {
                                        if(ch_result){
                                            db.epg_data.destroy({
                                                where: {channel_number: filtered_channel_number, program_start: {gte: current_time}}
                                            }).then(function (result) {
                                                channel_list[''+channel.$.id+''] = ({title: channel["display-name"]});
                                                callback(null, channel_list); //move control to next foreach iteration
                                            }).catch(function(error) {
                                                callback(true);//todo: provide some info to error
                                            });
                                        }
                                        else callback(null, channel_list); //move control to next foreach iteration
                                        return null;
                                    }).catch(function(error) {
                                        callback(true); //todo: provide some info to error
                                    });
                                }, function (error) {
                                    if(error){ callback(true, 'Error step xxx');} //todo: proper message
                                    if(!error) {
                                        callback(null, channel_list)//move control to next function
                                    }
                                });
                                return null;
                            },
                            save_epg: ['delete_existing_epg', function(channels, callback) {
                                programs.forEach(function(program){
                                    //the program object cannot be empty, the channel for this program should be in the file and should have passed the user filter
                                    if(program.$ != undefined && channel_list[''+program.$.channel+'']){
                                        try{
                                            db.channels.findOne({
                                                attributes: ['id', 'channel_number', 'title'],
                                                where: {title: channel_list[''+program.$.channel+''].title}
                                            }).then(function (result) {
                                                //if channel info found, let's save the epg record
                                                if( result && ((req.body.channel_number === null) || (req.body.channel_number == result.channel_number)) ){
                                                    //only insert future programs (where program_start > current)
                                                    if( moment(stringtodate(program.$.start)).subtract(req.body.timezone, 'hour').format('YYYY-MM-DD HH:mm:ss') > moment(current_time).format('YYYY-MM-DD HH:mm:ss')){
                                                        db.epg_data.create({
                                                            channels_id: result.id,
                                                            channel_number: result.channel_number,
                                                            title: (program.title[0]._) ? program.title[0]._ : program.title[0],
                                                            short_name: (program.title[0]._) ? program.title[0]._ : program.title[0],
                                                            short_description: (program.desc[0]._) ? program.desc[0]._ : program.desc[0],
                                                            program_start: moment(stringtodate(program.$.start)).subtract(req.body.timezone, 'hour'),
                                                            program_end: moment(stringtodate(program.$.stop)).subtract(req.body.timezone, 'hour'),
                                                            long_description: (program.desc[0]._) ? program.desc[0]._ : program.desc[0],
                                                            duration_seconds: datetimediff_seconds(stringtodate(program.$.start), stringtodate(program.$.stop)) //is in seconds
                                                        }).then(function (result) {
                                                            //on each write, do nothing. we wait for the saving proccess to finish
                                                        }).catch(function(error) {
                                                            //error while saving records
                                                        });
                                                    }

                                                }
                                                return null;
                                            }).catch(function(error) {
                                                //error while saving records
                                            });
                                        }
                                        catch(error){
                                            //todo: display info that some data were not saved?
                                        }
                                    }
                                });
                            }]
                        }, function(error, results) {
                            if(error) {
                                return res.status(400).send({message: message}); //serverside filetype validation
                            }
                            else return res.status(200).send({message: 'Epg records were saved'}); //serverside filetype validation
                        });

                    } //file records successfully read, and attempted to save them
                }
                catch(error){
                    //error while trying to read the file. Probably it is empty or is missing the tv tags
                    message = 'Malformed file';
                }
            });
        });
        message = 'Epg records were saved';
        return res.status(200).send({message: message});
    }
    catch(error){
        message = 'Unable to save the epg records';
        return res.status(400).send({message: message});
    }
}

function import_csv(req, res, current_time){
    var message = '';
    var channel_number_list = [];

    async.auto({
        //reads entire csv file. saves into channel_number_list only the number of those channels that are in the file and are not filtered out by the channel_number input
        get_channels: function(callback) {
            var channel_number_stream = fs.createReadStream(path.resolve('./public')+req.body.epg_file, req.body.encoding); //link main url
            fastcsv.fromStream(channel_number_stream, {headers : true}, {ignoreEmpty: true}).validate(function(data){
                if(req.body.channel_number){
                    return data.channel_number == req.body.channel_number; //if a channel_number is specified, filter out other channels
                }
                else{
                    return data;
                }
            }).on("data", function(data){
                if(channel_number_list.indexOf(data.channel_number) === -1) {
                    channel_number_list.push(data.channel_number); //prepare array with numbers of channels whose programs will be imported
                }
            }).on("end", function(){
                callback(null); //reading file ended. pass control to next function
            });
        },
        //deletes future epg for channels whose epg will be imported
        delete_epg: ['get_channels', function(results, callback) {
            if(channel_number_list.length < 1){
                message = 'Unable to read any records. Epg data not saved';
                callback(true); // no channels to import epg. pass control to the end
            }
            else{
                DBModel.destroy({
                    where: {program_start: {gte: current_time}, channel_number: {in: channel_number_list}}
                }).then(function (result) {
                    callback(null, 1); // future epg was deleted for channels on our list. pass control to next function
                }).catch(function(error) {
                    if(error.message.split(': ')[0] === 'ER_ROW_IS_REFERENCED_2') message = 'Delete failed: At least one of these programs is scheduled';
                    else message = 'Unable to proceed with the action';
                    callback(true); // error occured while deleting future epg. pass control to the end
                });
            }
        }],
        save_epg: ['delete_epg', function(epg_data, callback) {
            var stream = fs.createReadStream(path.resolve('./public')+req.body.epg_file, req.body.encoding); // read csv file
            fastcsv.fromStream(stream, {headers : true}, {ignoreEmpty: true}).validate(function(data){
                if(req.body.channel_number){
                    return data.channel_number == req.body.channel_number; //if a channel_number is specified, filter out epg for other channels
                }
                else return data; //no channel_number was specified, return all records
            }).on("data", function(data){
                //only insert future programs (where program_start > current). take into account timezone used to generate the epg file
                if(data && (moment(data.program_start, 'MM/DD/YYYY HH:mm:ss').subtract(req.body.timezone, 'hour').format('YYYY-MM-DD HH:mm:ss') > moment(current_time).format('YYYY-MM-DD HH:mm:ss')) ){
                    DBModel.create({
                        channels_id: data.channel_id,
                        channel_number: data.channel_number,
                        title: data.title,
                        short_name: data.short_name,
                        short_description: data.short_description,
                        program_start: moment(data.program_start, 'MM/DD/YYYY HH:mm:ss').subtract(req.body.timezone, 'hour'),
                        program_end: moment(data.program_end, 'MM/DD/YYYY HH:mm:ss').subtract(req.body.timezone, 'hour'),
                        long_description: data.long_description,
                        duration_seconds: data.duration
                    }).then(function (result) {
                    }).catch(function(error) {
                        message = 'Unable to save some epg records';
                    });
                }
            }).on("end", function(){
                callback(null);
            });
        }]
    }, function(error, results) {
        if(error) {
            return res.status(400).send({message: message});
        }
        else return res.status(200).send({message: 'Epg records were saved'});
    });

}

//import xml file, digitalb format
function import_xml_dga(req, res, current_time){
    var import_log = [];
    async.auto({
        read_file: function(callback) {
            fs.readFile(path.resolve('./public'+req.body.epg_file), req.body.encoding, function(err, data) {
                if(err) {
                    callback(true, {"message": 'Error reading this xml file'});
                }
                else callback(null, data);
            });
        },
        parse_file: ['read_file', function(results, callback) {
            var parser = new xml2js.Parser();
            parser.parseString(results.read_file, function (err, epg_data) {
                if(err) {
                    callback(true, {"message": 'Error parsing this xml file'});
                }
                else callback(null, epg_data);
            });
        }],
        save_epg: ['parse_file', function(results, callback) {
            var all_programs = results.parse_file.WIDECAST_DVB.channel; //stores the whole list of channel objects from the xml file
            // iterate over each channel
            all_programs.forEach(function(channels){
                var channel_name = channels.$.name;
                var filtered_channel_number = (req.body.channel_number) ? req.body.channel_number : {gte: -1}; //channel from epg file that is being proccessed, if allowed by channel_number input
                //find channel id and number for this channel
                db.channels.findOne({
                    attributes: ['channel_number', 'id'],
                    where: {title: channel_name, channel_number: filtered_channel_number}
                }).then(function (channel_data) {
                    if(channel_data){
                        //destroys future epg for filtered channels
                        db.epg_data.destroy({
                            where: {channel_number: channel_data.channel_number, program_start: {gte: current_time}}
                        }).then(function (result) {
                            //iterate over all events of this channel
                            channels.event.forEach(function(events){
                                if(events && (moment(events.$.start_time).subtract(req.body.timezone, 'hour').format('YYYY-MM-DD HH:mm:ss') > moment(current_time).format('YYYY-MM-DD HH:mm:ss')) ){
                                    //only insert future programs (where program_start > current)
                                    db.epg_data.create({
                                        channels_id: channel_data.id,
                                        channel_number: channel_data.channel_number,
                                        title: events.short_event_descriptor[0].$.name,
                                        short_name: events.short_event_descriptor[0].$.name,
                                        short_description: events.short_event_descriptor[0]._,
                                        program_start: moment(events.$.start_time).subtract(req.body.timezone, 'hour'),
                                        program_end: moment.unix(parseInt(moment(events.$.start_time).format('X')) + parseInt(events.$.duration) - req.body.timezone*3600  ).format('YYYY-MM-DD HH:mm:ss'),
                                        long_description: events.extended_event_descriptor[0].text[0],
                                        duration_seconds: events.$.duration //is in seconds
                                    }).catch(function(error) {
                                        import_log.push({"error": "Failed to create epg record", "error_logs": error});
                                    });
                                }
                                else{
                                    import_log.push({"error": "Failed to create epg record", "error_logs": "Event time has expired "+events});
                                }
                            });
                        }).catch(function(error) {
                            import_log.push({"error": "Failed to delete epg record", "error_logs": error});
                            callback(null); //event deletion failed. pass control to next epg record iteration
                        });
                    }
                    else{
                        import_log.push({"error": "Channel not found", "error_logs": "Channel "+channel_name+" either does not exist, or was filtered by your input channel number."});
                    }
                    return null;
                }).catch(function(error) {
                    import_log.push({"error": "Error searching for channel", "error_logs": error});
                    callback(null);
                });
            });
            callback(null); //passes control to next step, sending status
        }]
    }, function(error, results) {

        if(error) {
            return res.status(400).send({message: error}); //todo: catch message from callback
        }
        else {
            return res.status(200).send({message: 'Epg records were saved'}); //serverside filetype validation
        }
    });
}

function stringtodate(date){
    return date.substring(0,4)+'-'+date.substring(4,6)+'-'+date.substring(6,8)+' '+date.substring(8,10)+':'+date.substring(10,12)+':'+date.substring(12, 14);
}
function datetimediff_seconds(start, end){
    return parseInt(moment(end).format('X')) - parseInt(moment(start).format('X')); //format('X') makes sure timestamps are in seconds
}