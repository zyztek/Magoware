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
        DBModel.destroy({
            where: {program_start: {gte: current_time}}
        }).then(function (result) {
            read_and_write_epg();
            return null;
        }).catch(function(error) {
            if(error.message.split(': ')[0] === 'ER_ROW_IS_REFERENCED_2') return res.status(400).send({message: 'Delete failed: At least one of these programs is scheduled'}); //referenced record cannot be deleted
            else return res.status(400).send({message: 'Unable to proceed with the action'}); //other error occurred
        });
    }

    function read_and_write_epg(){
        if(fileHandler.get_extension(req.body.epg_file)=== '.csv'){
            import_csv(req, res);
        }
        else if(fileHandler.get_extension(req.body.epg_file)=== '.xml'){
            import_xml_standard(req, res); // xmlparser
        }
        else {
            return res.status(400).send({message: 'Incorrect file type'}); //serverside filetype validation
        }
    }

}

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

    DBChannels.findAll({
        attributes: [['channel_number', 'id'],['title','content']]
    }).then(function(channels){
        //res.json(channels);
        DBModel.findAll({
                attributes: ['id', ['channel_number', 'group'],['program_start','start'],['program_end','end'],['title','content']]
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

function import_xml_standard(req, res){
    var message = '';
    try{
        var parser = new xml2js.Parser();
        fs.readFile(path.resolve('./public')+req.body.epg_file, function(err, data) {
            parser.parseString(data, function (err, result) {
                var channel_list = new Array(); //associative array to contain title, with id as identifier for the channels
                try{
                    var channels = result.tv.channel; //all channel records
                    var programs = result.tv.programme; //all programs of all channels
                    if(result.tv.channel != undefined && result.tv.programme != undefined){
                        async.waterfall([
                            //save channel title in an associative array, so that we refer the title by channel id
                            function(callback) {
                                channels.forEach(function(array){
                                    channel_list[''+array.$.id+''] = ({title: (array["display-name"][0]._) ? array["display-name"][0]._ : array["display-name"][0]  });
                                });
                                callback(null, channel_list);
                            },
                            //find channel id and number for each program, then save it
                            function(channel_list, callback) {
                                programs.forEach(function(program){
                                    if(program.$ != undefined){
                                        try{
                                            db.channels.findOne({
                                                attributes: ['id', 'channel_number', 'title'],
                                                where: {title: channel_list[''+program.$.channel+''].title}
                                            }).then(function (result) {
                                                //if channel info found, let's save the epg record
                                                if(result && ((req.body.channel_number === null) || (req.body.channel_number == result.channel_number))){
                                                    db.epg_data.create({
                                                        channels_id: result.id,
                                                        channel_number: result.channel_number,
                                                        title: (program.title[0]._) ? program.title[0]._ : program.title[0],
                                                        short_name: (program.title[0]._) ? program.title[0]._ : program.title[0],
                                                        short_description: (program.desc[0]._) ? program.desc[0]._ : program.desc[0],
                                                        program_start: stringtodate(program.$.start),
                                                        program_end: stringtodate(program.$.stop),
                                                        long_description: (program.desc[0]._) ? program.desc[0]._ : program.desc[0],
                                                        duration_seconds: datetimediff_seconds(stringtodate(program.$.start), stringtodate(program.$.stop)) //is in seconds
                                                    }).then(function (result) {
                                                        //on each write, do nothing. we wait for the saving proccess to finish
                                                    }).catch(function(error) {
                                                        //error while saving records
                                                    });
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
                            }
                        ], function (err) {
                            //error while trying to read / write data in the async model
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

function import_csv(req, res){
    var stream = fs.createReadStream(path.resolve('./public')+req.body.epg_file); //link main url
    var message = '';

    fastcsv.fromStream(stream, {headers : true}, {ignoreEmpty: true}).validate(function(data){
        if(req.body.channel_number){
            return data.channel_number == req.body.channel_number;
        }
        else{
            return data;
        }
    }).on("data-invalid", function(data){
        //these data were filtered out
    }).on("data", function(data){
        //TODO: handle error of malformed csv
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
            message = 'Unable to save all epg records';
        });

    });
    message = (message !== '') ? message : 'Epg records were saved';
    return res.status(200).send({message: message}); //serverside filetype validation
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
                        console.log("error te catch i search per kanale")//todo: error
                        console.log(error)
                    });
                });
            });
            if(err) console.log(err)
        });
    }
    catch(error){
        console.log('error catch')
        console.log(error)
    }
}

function stringtodate(date){
    return date.substring(0,4)+'-'+date.substring(4,6)+'-'+date.substring(6,8)+' '+date.substring(8,10)+':'+date.substring(10,12)+':'+date.substring(12, 14);
}
function datetimediff_seconds(start, end){
    return parseInt(moment(end).format('X')) - parseInt(moment(start).format('X')); //format('X') makes sure timestamps are in seconds
}