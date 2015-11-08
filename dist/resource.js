'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _fetch2 = require('./fetch');

var _fetch3 = _interopRequireDefault(_fetch2);

require('isomorphic-fetch');
var _fetch = _fetch3['default'](global.fetch);

var resource = function resource() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var defaultState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var inflight = {};

    var store = _store2['default'](defaultState);
    var url = config.url;
    var fetch = config.fetch;
    var nocache = config.nocache;
    var name = config.name;
    var cacheDuration = config.cacheDuration;
    var f = fetch || _fetch;

    var get = function get(id) {
        for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
        }

        // generate a key unique to this request for muxing/batching,
        // if need be (serialized with the options)
        var _id = id;
        if (_id instanceof Object) _id = Object.keys(_id).sort().map(function (k) {
            return k + ':' + id[k];
        }).join(',');

        // console.log('request to:', url(id, ...params), 'with', id, params)

        // get an inflight Promise the resolves to the data, keyed by `id`,
        // or create a new one
        return inflight[_id] || (inflight[_id] = new Promise(function (res, rej) {
            return (nocache ? Promise.reject() : _cache2['default'].getItem(name + ':' + id)).then(function (d) {
                return res(d);
            })['catch'](function (error) {
                return(
                    // whatever fetching mechanism is used (batched, muxed, etc)
                    // send the resourceName, id, params with the request as options.
                    // if it is going the node server, node (when demuxing) will use the
                    // extra options to rebuild the URL
                    //
                    // in normal URL requests, we can just carry on as normal
                    f(url.apply(undefined, [id].concat(params)), { resourceName: name, id: id, params: params }).then(function (d) {
                        if (!d) throw 'no data returned from ' + name + ':' + id;
                        return d;
                    }).then(function (d) {
                        return store.dispatch(function (state, next) {
                            var _extends2, _extends3;

                            var _state = _extends({}, state, (_extends2 = {}, _extends2[id] = d, _extends2)); // make new state
                            inflight = _extends({}, inflight, (_extends3 = {}, _extends3[_id] = undefined, _extends3)); // clear in-flight promise
                            !nocache && _cache2['default'].setItem(name + ':' + id, d, cacheDuration);
                            next(_state); // store's new state is _state
                        }).then(function (state) {
                            return state[id];
                        });
                    }) // pipe state[id] to the call to f()
                    .then(function (d) {
                        return res(d);
                    }) // resolve the f(url(id))
                    ['catch'](function (e) {
                        var _extends4;

                        inflight = _extends({}, inflight, (_extends4 = {}, _extends4[_id] = undefined, _extends4)); // in case of fire...
                        rej(e);
                    })
                );
            });
        }));
    };

    return { name: name, store: store, get: get };
};

exports['default'] = resource;
module.exports = exports['default'];