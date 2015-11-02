'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fetch = require('./fetch');

var _fetch2 = _interopRequireDefault(_fetch);

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _resource = require('./resource');

var _resource2 = _interopRequireDefault(_resource);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

exports['default'] = { cache: _cache2['default'], fetch: _fetch2['default'], store: _store2['default'], resource: _resource2['default'], router: _router2['default'] };
module.exports = exports['default'];