'use strict';

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fetch = require('./fetch');

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _resource = require('./resource');

var _resource2 = _interopRequireDefault(_resource);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _mux = require('./mux');

var _mux2 = _interopRequireDefault(_mux);

var _csp = require('./csp');

var _csp2 = _interopRequireDefault(_csp);

var _fp = require('./fp');

var fp = _interopRequireWildcard(_fp);

exports['default'] = { cache: _cache2['default'], store: _store2['default'], resource: _resource2['default'], router: _router2['default'], batch: _fetch.batch, fetch: _fetch.fetch, cancellable: _fetch.cancellable, mux: _mux2['default'], channel: _csp2['default'], fp: fp };
module.exports = exports['default'];