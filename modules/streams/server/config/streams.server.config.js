'use strict';

var streamtokens = {
    "AKAMAI":  {
        "TOKEN_KEY": "AKAMAI_TOKEN_KEY",
        "WINDOW":     10000,
        "SALT": "AKAMAI_SALT"
    },

    "FLUSSONIC":  {
        "TOKEN_KEY":  "FLUSSONIC_TOKEN_KEY",
        "SALT":       "FLUSSONIC_SALT",
        "PASSWORD":   "FLUSSONIC_PASSWORD",
        "WINDOW":     10000
    },
}

/**
 * Module init function.
 */
module.exports = function(app, db) {
    app.locals.streamtokens = streamtokens;
};

