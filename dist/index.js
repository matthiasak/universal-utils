'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _resource = require('./resource');

var _resource2 = _interopRequireDefault(_resource);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _fetcher = require('./fetcher');

var _fetcher2 = _interopRequireDefault(_fetcher);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

require('isomorphic-fetch');

exports['default'] = { cache: _cache2['default'], fetch: fetch, store: _store2['default'], resource: _resource2['default'], fetcher: _fetcher2['default'], router: _router2['default'] };
module.exports = exports['default'];