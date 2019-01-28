'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')),
    DBModel = db.models.genre,
    refresh = require(path.resolve('./modules/mago/server/controllers/common.controller.js')),
    winston = require('winston'),
    fs = require('fs');

/**
 * Create
 */
exports.create = function(req, res) {

    DBModel.findOne({
        attributes: ['id'],
        order: [['id', 'DESC']]
    }).then(function(result) {
        //category id nr 666 is reserved for Favorites, so it will not be assigned to any category
        if(result && result.id === 665){
            req.body.id = 667;
        }
        DBModel.create(req.body).then(function(result) {
            if (!result) {
                return res.status(400).send({message: 'fail create data'});
            } else {
                return res.jsonp(result);
            }
        }).catch(function(err) {
            winston.error("Creating genre failed with error: ", err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
        return null;
    }).catch(function(err) {
        winston.error("Getting genre data failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });

};

/**
 * Show current
 */
exports.read = function(req, res) {
  res.json(req.genre);
};

/**
 * Update
 */
exports.update = function(req, res) {
    var updateData = req.genre;

    if(updateData.icon_url != req.body.icon_url) {
        var deletefile = path.resolve('./public'+updateData.icon_url);
    }
    updateData.updateAttributes(req.body).then(function(result) {
        if(deletefile)
        fs.unlink(deletefile, function (err) {
            //todo: return some error message???
        });
        return res.jsonp(result);
    }).catch(function(err) {
        winston.error("Updating genre failed with error: ", err);
        res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
        return null;
    });
};

/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.genre;

    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {
            result.destroy().then(function() {
                return res.json(result);
            }).catch(function(ER_ROW_IS_REFERENCED_2) {
                return res.status(400).send({ message: "Cannot delete genre with channels" }) //this row is referenced by another record
            }).catch(function(error) {
                winston.error("Deleting genre failed with error: ", error);
                return res.status(400).send({ message: "Unable to delete genre" })
            });
        } else {
            return res.status(400).send({ message: 'Unable to find the Data' });
        }
        return null;
    }).catch(function(err) {
        winston.error("Finding genre failed with error: ", err);
        return res.status(400).send({ message: "Unable to delete genre" });
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
    qwhere.$or.description = {};
    qwhere.$or.description.$like = '%'+query.q+'%';
  }

  //start building where
  final_where.where = qwhere;
  if(parseInt(query._start)) final_where.offset = parseInt(query._start);
  if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
  if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;

  final_where.include = [{model:db.models.channels,  required: true}];

  DBModel.findAndCountAll({
      attributes:['id','description', 'icon_url', 'is_available'],
      include:[{
          model:db.models.channels, required:false,
          attributes:[[db.sequelize.fn('count',db.sequelize.col('channels.id')),'total']],
          nested: true
      }],
      group:['genre.id','genre.description']
  }).then(function(results) {
      if (!results) {
          res.status(404).send({
              message: 'No data found'
          });
          return null;
      } else {
          res.setHeader("X-Total-Count", results.count);
          return res.json(results.rows);
      }
  }).catch(function(err) {
      winston.error("Getting genre list failed with error: ", err);
      return res.jsonp(err);
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
      res.status(404).send({
        message: 'No data with that identifier has been found'
      });
    } else {
      req.genre = result;
      next();
      return null;
    }
  }).catch(function(err) {
      winston.error("Finding genre failed with error: ", err);
      next(err);
      return null;
  });

};
