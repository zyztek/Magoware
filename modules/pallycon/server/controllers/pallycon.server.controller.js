'use strict';


var path = require('path');
var makeDrm = require(path.resolve('./modules/pallycon/server/core/logics/makeDrmData'));
var issueCID = require(path.resolve('./modules/pallycon/server/core/logics/CIDIssue'));
var rightsInfo = require(path.resolve('./modules/pallycon/server/core/logics/ContentUsageRightsInfo'));

exports.handleCIDIssue = function(req, res) {
    console.log('req data: ' + req.body.data);
    res.send(issueCID.makeRes(req.body.data));
}

exports.handleContentUsageRightInfo = function(req, res) {
    res.send(rightsInfo.makeRes(req.body.data));
}
