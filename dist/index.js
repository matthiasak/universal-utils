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

var cache = require('./cache' + (global.document ? '/browser.js' : ''));
exports['default'] = { cache: cache, fetch: _fetch2['default'], store: _store2['default'], resource: _resource2['default'] };
module.exports = exports['default'];