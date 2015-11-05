'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fetch2 = require('./fetch');

var _fetch3 = _interopRequireDefault(_fetch2);

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _resource = require('./resource');

var _resource2 = _interopRequireDefault(_resource);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _demux = require('./demux');

var _demux2 = _interopRequireDefault(_demux);

require('isomorphic-fetch');
var _fetch = global.fetch;
var fetch = _fetch3['default'](_fetch);

exports['default'] = { cache: _cache2['default'], fetch: fetch, store: _store2['default'], resource: _resource2['default'], router: _router2['default'], batch: _fetch3['default'], demux: _demux2['default'] };
module.exports = exports['default'];