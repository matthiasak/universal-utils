'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fetch = require('./fetch');

var fetch = _interopRequireWildcard(_fetch);

var _store = require('./store');

var store = _interopRequireWildcard(_store);

var _resource = require('./resource');

var resource = _interopRequireWildcard(_resource);

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

var _router = require('./router');

var router = _interopRequireWildcard(_router);

var _mux = require('./mux');

var mux = _interopRequireWildcard(_mux);

var _csp = require('./csp');

var csp = _interopRequireWildcard(_csp);

var _vdom = require('./vdom');

var vdom = _interopRequireWildcard(_vdom);

var _fp = require('./fp');

var fp = _interopRequireWildcard(_fp);

var _ot = require('./ot');

var ot = _interopRequireWildcard(_ot);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

module.exports = _extends({}, fetch, store, resource, cache, router, mux, csp, vdom, fp, ot);