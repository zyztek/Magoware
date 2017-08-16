'use strict';
var defaultEnvConfig = require('./default');
process.env.DB_LOG = true;

module.exports = {
  secure: {
    ssl: Boolean(process.env.ssl) || false,
    privateKey: './config/sslcertificate/key.txt',
    certificate: './config/sslcertificate/certificate.txt',
    ca: './config/sslcertificate/magoware.ca-bundle.txt'
  },

  db: require('./db.connection.js'),

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    database: process.env.REDIS_DATABASE || 0,
    password: process.env.REDIS_PASSWORD || ""
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      //stream: 'access.log'
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  mailer: {
    from: process.env.MAILER_FROM || 'noreply@magoware.tv', //'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
  livereload: true
};
