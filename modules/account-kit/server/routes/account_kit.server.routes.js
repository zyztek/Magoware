
var path = require('path'),
    accountKit = require(path.resolve('./modules/account-kit/server/controllers/-.server.controller'));

module.exports = function(app) {
    app.route('/apiv2/account-kit/login')
        .get(accountKit.handleRenderLoginForm)
    
    app.route('/apiv2/account-kit/callback')
        .get(accountKit.handleLoginSuccess)
}