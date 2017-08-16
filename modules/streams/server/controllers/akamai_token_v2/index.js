"use strict";
var path = require('path');

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TokenGenerator = require(path.resolve('./modules/streams/server/controllers/akamai_token_v2/TokenGenerator'));


var _TokenGenerator2 = _interopRequireDefault(_TokenGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _TokenGenerator2.default;