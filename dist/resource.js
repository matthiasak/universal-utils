'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _store2 = require('./store');

var _store3 = _interopRequireDefault(_store2);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _fetch = require('./fetch');

var _fetch2 = _interopRequireDefault(_fetch);

var resource = function resource() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var defaultState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var inflight = {};

    var _store = _store3['default'](defaultState);
    var get = config.get;
    var getURL = config.getURL;
    var parse = config.parse;
    var nocache = config.nocache;
    var name = config.name;
    var cacheDuration = config.cacheDuration;

    var _get = function _get(id) {
        for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
        }

        var _id = id;

        if (_id instanceof Object) _id = Object.keys(_id).sort().map(function (k) {
            return k + ':' + _id[k];
        }).join(',');
        // get an inflight Promise the resolves to the data, keyed by `id`,
        // or create a new one
        return inflight[_id] || (inflight[_id] = new Promise(function (res, rej) {
            return (nocache ? Promise.reject() : _cache2['default'].getItem(name + ':' + id)).then(function (d) {
                return res(d);
            })['catch'](function (error) {
                return (get instanceof Function ? get.apply(undefined, [id].concat(params)) : _fetch2['default'](getURL.apply(undefined, [id].concat(params)))).then(function (d) {
                    return !global.document && parse ? parse(d) : d;
                }).then(function (d) {
                    if (!d) throw 'no data returned from ' + name + ':' + _id;
                    return d;
                }).then(function (d) {
                    return _store.dispatch(function (state, next) {
                        var _extends2, _extends3;

                        var _state = _extends({}, state, (_extends2 = {}, _extends2[_id] = d, _extends2)); // make new state
                        inflight = _extends({}, inflight, (_extends3 = {}, _extends3[_id] = undefined, _extends3)); // clear in-flight promise
                        !nocache && _cache2['default'].setItem(name + ':' + _id, d, cacheDuration);
                        next(_state); // store's new state is _state
                    }).then(function (state) {
                        return state[_id];
                    });
                }) // pipe state[id] to get()
                .then(function (d) {
                    return res(d);
                }) // resolve the get(id)
                ['catch'](function (e) {
                    var _extends4;

                    inflight = _extends({}, inflight, (_extends4 = {}, _extends4[_id] = undefined, _extends4)); // in case of fire...
                    rej(e);
                });
            });
        }));
    };

    return _extends({}, config, {
        store: _store,
        get: _get
    });
};

exports['default'] = resource;
module.exports = exports['default'];