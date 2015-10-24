'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fetch = require('./fetch');

var _fetch2 = _interopRequireDefault(_fetch);

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _resource = require('./resource');

var _resource2 = _interopRequireDefault(_resource);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _fetcher = require('./fetcher');

var _fetcher2 = _interopRequireDefault(_fetcher);

exports['default'] = { cache: _cache2['default'], fetch: _fetch2['default'], store: _store2['default'], resource: _resource2['default'], fetcher: _fetcher2['default'] };
module.exports = exports['default'];