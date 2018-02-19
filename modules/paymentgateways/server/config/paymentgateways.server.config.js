'use strict';

var paymenttokens = {

    "STRIPE":  {
        "API_KEY":        "sk_test_Z4OH3P3t6XXwInfSUAnk2t0y",
        "ENDPOIN_REFUND": "whsec_3j1DXYo5wvw5DsCDnTZZKQqOWhTd4Koi"
    }
}

/**
 * Module init function.
 */
module.exports = function(app, db) {
    app.locals.paymenttokens = paymenttokens;
};
