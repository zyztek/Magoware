"use strict";

var winston = require('winston');
var logger = new(winston.Logger)();

logger.add(winston.transports.Console, {
  level: (process.env.NODE_ENV === 'development')?'verbose':'error',
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: true
});

logger.add(winston.transports.File, {
  filename: 'errors.log',
  level: 'error',
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: true
});



logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;
