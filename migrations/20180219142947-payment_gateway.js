'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('salesreport', 'transaction_id', {
            type: Sequelize.STRING(128),
            allowNull: false,
            after: 'id'
        }).then(function (success) {
            return queryInterface.addColumn('salesreport', 'cancelation_date', {type: Sequelize.DATE}).then(function (success) {
                return queryInterface.addColumn('salesreport', 'cancelation_user', {type: Sequelize.STRING(128)}).then(function (success) {
                    return queryInterface.addColumn('salesreport', 'cancelation_reason', {type: Sequelize.STRING(128)}).then(function (success) {
                        return queryInterface.addColumn('combo', 'product_id', {
                            type: Sequelize.STRING(64),
                            allowNull: false,
                            after: 'id'
                        }).then(function (success) {
                            return queryInterface.addColumn('payment_transactions', 'product_id', {
                                type: Sequelize.STRING(32),
                                allowNull: true,
                                after: 'customer_username'
                            }).then(function (success) {
                                return queryInterface.addColumn('payment_transactions', 'transaction_type', {
                                        type: Sequelize.STRING(32),
                                        allowNull: true,
                                        after: 'transaction_id'
                                    })
                                    .catch(function (err) {
                                        winston.error('Adding column payment_transactions.transaction_id failed with error message: ', err.message);
                                    });
                            }).catch(function (err) {
                                winston.error('Adding column payment_transactions.product_id failed with error message: ', err.message);
                            });
                        }).catch(function (err) {
                            winston.error('Adding column salesreport.product_id failed with error message: ', err.message);
                        });
                    }).catch(function (err) {
                        winston.error('Adding column salesreport.cancelation_reason failed with error message: ', err.message);
                    });
                }).catch(function (err) {
                    winston.error('Adding column salesreport.cancelation_user failed with error message: ', err.message);
                });
            }).catch(function (err) {
                winston.error('Adding column salesreport.cancelation_date failed with error message: ', err.message);
            });
        }).catch(function (err) {
            winston.error('Adding column salesreport.transaction_id failed with error message: ', err.message);
        });
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.removeColumn('salesreport', 'transaction_id').then(function (success) {
          return queryInterface.removeColumn('salesreport', 'cancelation_date').then(function (success) {
              return queryInterface.removeColumn('salesreport', 'cancelation_user').then(function (success) {
                  return queryInterface.removeColumn('salesreport', 'cancelation_reason').then(function (success) {
                      return queryInterface.removeColumn('product_id', 'combo')
                          .catch(function (err) {
                              winston.error('Removing column combo.product_id failed with error message: ', err.message);
                          });
                  }).catch(function (err) {
                      winston.error('Removing column settings.vod_subset_nr failed with error message: ', err.message);
                  });
              }).catch(function (err) {
                  winston.error('Removing column settings.vod_subset_nr failed with error message: ', err.message);
              });
          }).catch(function (err) {
              winston.error('Removing column settings.vod_subset_nr failed with error message: ', err.message);
          });
      }).catch(function (err) {
          winston.error('Removing column settings.vod_subset_nr failed with error message: ', err.message);
      });
  }
};
