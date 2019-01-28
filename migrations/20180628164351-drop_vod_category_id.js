'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('vod', 'category_id').catch(function (err) {
            winston.error('Dropping column vod.category_id failed with error message: ', err.message);
        });
    }
};

