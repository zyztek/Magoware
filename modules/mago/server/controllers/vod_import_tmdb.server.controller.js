'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    sequelize_t = require(path.resolve('./config/lib/sequelize')),
    DBModel = db.vod,
    refresh = require(path.resolve('./modules/mago/server/controllers/common.controller.js')),
    request = require("request"),
    fs = require('fs'),
    winston = require(path.resolve('./config/lib/winston'));
var download = require('download-file');

function link_vod_with_genres(vod_id,array_category_ids, db_model) {
    var transactions_array = [];
    //todo: references must be updated to non-available, not deleted
    return db_model.update(
        {
            is_available: false
        },
        {
            where: {
                vod_id: vod_id,
                category_id: {$notIn: array_category_ids}
            }
        }
    ).then(function (result) {
        return sequelize_t.sequelize.transaction(function (t) {
            for (var i = 0; i < array_category_ids.length; i++) {
                transactions_array.push(
                    db_model.upsert({
                        vod_id: vod_id,
                        category_id: array_category_ids[i],
                        is_available: true
                    }, {transaction: t}).catch(function(error){
                        winston.error(error);
                    })
                )
            }
            return Promise.all(transactions_array, {transaction: t}); //execute transaction
        }).then(function (result) {
            return {status: true, message:'transaction executed correctly'};
        }).catch(function (err) {
            winston.error(err);
            return {status: false, message:'error executing transaction'};
        })
    }).catch(function (err) {
        winston.error(err);
        return {status: false, message:'error deleting existing packages'};
    })
}

function link_vod_with_packages(item_id, data_array, model_instance) {
    var transactions_array = [];

    return model_instance.destroy({
        where: {
            vod_id: item_id,
            package_id: {$notIn: data_array}
        }
    }).then(function (result) {
        return sequelize_t.sequelize.transaction(function (t) {
            for (var i = 0; i < data_array.length; i++) {
                transactions_array.push(
                    model_instance.upsert({
                        vod_id: item_id,
                        package_id: data_array[i]
                    }, {transaction: t})
                )
            }
            return Promise.all(transactions_array, {transaction: t}); //execute transaction
        }).then(function (result) {
            console.log("tek successful transaction")
            return {status: true, message:'transaction executed correctly'};
        }).catch(function (err) {
            winston.error(err);
            return {status: false, message:'error executing transaction'};
        })
    }).catch(function (err) {
        winston.error(err);
        return {status: false, message:'error deleteting existing packages'};
    })
}

/**
 * Create
 */
exports.create = function(req, res) {
    var array_vod_vod_categories = req.body.vod_vod_categories || [];
    delete req.body.vod_vod_categories;

    var array_package_vod = req.body.package_vods || [];
    delete req.body.package_vods;

    if(req.body.icon_url.startsWith("/files/vod/")){
        console.log('success');
    }else{
        var origin_url_icon_url = 'https://image.tmdb.org/t/p/w500'+req.body.icon_url;
        var destination_path_icon_url = "./public/files/vod/";
        var vod_filename_icon_url = req.body.icon_url; //get name of new file
        var options_icon_url = {
            directory: destination_path_icon_url,
            filename: vod_filename_icon_url
        };
        download(origin_url_icon_url, options_icon_url, function(err){
            if (err){
                winston.error("error donwloading? "+err);
            }
            else{
                console.log('sucess');
            }
        });
        // delete req.body.poster_path;
        req.body.icon_url = '/files/vod'+vod_filename_icon_url;
    }

    if(req.body.image_url.startsWith("/files/vod/")){
        console.log('success');
    }else{
        var origin_url_image_url = 'https://image.tmdb.org/t/p/original'+req.body.image_url;
        var destination_path_image_url = "./public/files/vod/";
        var vod_filename_image_url = req.body.image_url; //get name of new file
        var options = {
            directory: destination_path_image_url,
            filename: vod_filename_image_url
        };
        download(origin_url_image_url, options, function(err){
            if (err){
                winston.error("error donwloading? "+err);
            }
            else{
                console.log('sucess');
            }
        });
        // delete req.body.backdrop_path;
        req.body.image_url = '/files/vod'+vod_filename_image_url;
    }


    DBModel.create(req.body).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail create data'});
        } else {
            // logHandler.add_log(req.token.uid, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));
            return link_vod_with_genres(result.id,array_vod_vod_categories, db.vod_vod_categories).then(function(t_result) {
                if (t_result.status) {
                    return link_vod_with_packages(result.id, array_package_vod, db.package_vod).then(function(t_result) {
                        if (t_result.status) {
                            return res.jsonp(result);
                        }
                        else {
                            return res.send(t_result);
                        }
                    })
                }
                else {
                    return res.send(t_result);
                }
            })
        }
    }).catch(function(err) {
        winston.error(err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * Show current
 */
exports.read = function(req, res) {
    res.json(req.vod);
};


exports.list = function(req, res) {
    var query = req.query;
    var page = query.page || 1;

    if(parseInt(query._start)) page = parseInt(query._start);

    var options = { method: 'GET',
        url: 'https://api.themoviedb.org/3/search/movie',
        qs:
            { page: page,
                query: query.q,
                api_key: 'e76289b7e0306b6e6b6088148b804f01' },
        body: '{}' };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let res_data = JSON.parse(body);
        res.setHeader("X-Total-Count", res_data.total_results);
        res.send(res_data.results);
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

    var options = { method: 'GET',
        url: 'https://api.themoviedb.org/3/movie/'+id,
        qs:
            { language: 'en-US',
                api_key: 'e76289b7e0306b6e6b6088148b804f01' },
        body: '{}' };


    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let res_data = JSON.parse(body);

        res_data.description = res_data.overview; delete res_data.overview;
        res_data.duration = res_data.runtime; delete res_data.runtime;
        res_data.adult_content = res_data.adult; delete res_data.adult;
        res_data.icon_url = res_data.poster_path; delete res_data.poster_path;
        res_data.image_url = res_data.backdrop_path; delete res_data.backdrop_path;

        res.send(res_data);
    });


};

/**
 * @api {post} /api/update_film/ update film
 * @apiVersion 0.2.0
 * @apiName UpdateFilm3rdParty
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiDescription Gets movie information from a third party and updates movie
 * @apiSuccessExample Success-Response:
 *     {
 *       "title": "Pan's Labyrinth",
 *       "imdb_id": "tt0457430",
 *       "overview": "In the falangist Spain of 1944, ...",
 *       "year": "2006",
 *       "rate": 8,
 *       "runtime": "118",
 *       "director": "Guillermo del Toro",
 *       "starring": "Ivana Baquero, Sergi López, Maribel Verdú, Doug Jones"
 *      }
 * @apiErrorExample Error-Response:
 *     {
 *        "message": "error message"
 *     }
 *     Error value set:
 *     An error occurred while updating this movie // Unexpected error occurred when the movie was being updated with teh new data
 *     Could not find this movie // the search params did not return any movie
 *     An error occurred while searching for this movie // Unexpected error occurred while searching for the movie in our database
 *     An error occurred while trying to get this movie's data // Unexpected error occurred while getting the movie's data from the 3rd party
 *     Unable to parse response // The response from the 3rd party service was of invalid format
 *     Unable to find the movie specified by your keywords // The 3rd party service could not find a match using our keywords
 *
 */
exports.update_film = function(req, res) {

    //todo: take care of case when param list is empty.
    var vod_where = {};
    if(req.body.imdb_id) vod_where.imdb_id = req.body.imdb_id;
    else if(req.body.vod_id) vod_where.id = req.body.vod_id;
    else {
        if(req.body.title) vod_where.title = req.body.title;
        if(req.body.year) vod_where.year = req.body.year;
    }

    DBModel.findOne({
        attributes: ['title', 'imdb_id'], where: vod_where
    }).then(function(vod_data){
        if(vod_data){
            var search_params = {"vod_title": vod_data.title};
            if(vod_data.imdb_id !== null) search_params.imdb_id = vod_data.imdb_id; //only use if it is not null
            omdbapi(search_params, function(error, response){
                if(error){
                    return res.status(404).send({
                        message: response
                    });
                }
                else{
                    DBModel.update(
                        response, {where: vod_where}
                    ).then(function(result){
                        res.send(response);
                    }).catch(function(error){
                        winston.error(error);
                        return res.status(404).send({
                            message: "An error occurred while updating this movie"
                        });
                    });
                    return null;
                }
            });
        }
        else return res.status(404).send({
            message: "Could not find this movie"
        });
    }).catch(function(error){
        winston.error(error);
        return res.status(404).send({
            message: "An error occurred while searching for this movie"
        });
    })



};
