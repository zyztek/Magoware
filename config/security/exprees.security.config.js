'use strict'

const config = {
    max_body_size: '100kb',
    cors: [
        //if empty all origins are ok
    ],
    max_request_min: 100,
    rate_protected_routes: [
        '/apiv2',
        '/apiv3',
        '/api/auth'
    ]
}

module.exports = config
