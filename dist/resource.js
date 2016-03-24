'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resource = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // The `resource()` module is a mechanism that wraps around the previous modules (`fetch()`, `cache()`, `store()`),
// exposing one primary method `get()`. Example code at end of file.

var _store = require('./store');

var _cache = require('./cache');

var _fetch2 = require('./fetch');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var resource = exports.resource = function resource() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var defaultState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


    var inflight = {};

    var store = (0, _store.store)(defaultState);
    var url = config.url;
    var fetch = config.fetch;
    var nocache = config.nocache;
    var name = config.name;
    var cacheDuration = config.cacheDuration;
    var f = fetch || _fetch2.fetch;

    var get = function get(id) {
        for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
        }

        // generate a key unique to this request for muxing/batching,
        // if need be (serialized with the options)
        var key = name + ':' + JSON.stringify(id) + ':' + JSON.stringify(params);

        // get an inflight Promise the resolves to the data, keyed by `id`,
        // or create a new one
        return inflight[key] || (inflight[key] = new Promise(function (res, rej) {
            return (nocache ? Promise.reject() : _cache.cache.getItem(key)).then(function (d) {
                return res(d);
            }).catch(function (error) {
                return(
                    // whatever fetching mechanism is used (batched, muxed, etc)
                    // send the resourceName, id, params with the request as options.
                    // if it is going the node server, node (when demuxing) will use the
                    // extra options to rebuild the URL
                    //
                    // in normal URL requests, we can just carry on as normal
                    f(url.apply(undefined, [id].concat(params)), { resourceName: name, id: id, params: params }).then(function (d) {
                        if (!d) throw 'no data returned from ' + key;
                        return d;
                    }).then(function (d) {
                        return store.dispatch(function (state, next) {
                            var _state = _extends({}, state, _defineProperty({}, key, d)); // make new state
                            inflight = _extends({}, inflight, _defineProperty({}, key, undefined)); // clear in-flight promise
                            !nocache && _cache.cache.setItem(key, d, cacheDuration);
                            next(_state); // store's new state is _state
                        }).then(function (state) {
                            return state[key];
                        });
                    }) // pipe state[_id] to the call to f()
                    .then(function (d) {
                        return res(d);
                    }) // resolve the f(url(id))
                    .catch(function (e) {
                        inflight = _extends({}, inflight, _defineProperty({}, key, undefined)); // in case of fire...
                        rej(e);
                    })
                );
            });
        }));
    };

    var clear = function clear(id) {
        for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            params[_key2 - 1] = arguments[_key2];
        }

        if (!id) {
            return _cache.cache.clearAll(name + ":");
        }

        // generate a key unique to this request for muxing/batching,
        // if need be (serialized with the options)
        var key = name + ':' + JSON.stringify(id) + ':' + JSON.stringify(params);
        return _cache.cache.setItem(key, null);
    };

    return { name: name, store: store, get: (0, _fetch2.cancellable)(get), clear: clear };
};

// !! Example usage
//
// !! isomorphic/universal usage
// const root = global.document ? window.location.origin : 'http://myapiserverurl.com'
// !! browser talks to node server, node server proxies to API
// const isomorphicfetch = require('isomorphic-fetch')
// !! muxer, that uses isomorphic fetch for transport on the client, but straight up isomorphic fetch() on node
// !! browser will send mux'ed requests to be demux'ed at '/mux'
// const fetch = global.document ? mux('/mux', isomorphicfetch) : isomorphicfetch
// const cacheDuration = 2*60*60*1000 // 2 hours
// !! url functions simply return a string, a call to resource.get(...args) will make a request to url(...args)
// !! imagine LOCATION.location() and SEARCH.search() exist and return strings, too
// const RESOURCES = {
//     PROPERTY: resource({ name: 'PROPERTY', fetch, cacheDuration,                   url: id => `props/${id}` }),
//     CATALOG: resource({ name: 'CATALOG', fetch, cacheDuration,                     url: id => `catalogs/${id}` }),
//     LOCATION: resource({ name: 'LOCATION', fetch, cacheDuration,                   url: (...args) => LOCATION.location(...args) }),
//     PRICE: resource({ name: 'PRICE', fetch, cacheDuration,                         url: id => `prices/${id}` }),
//     SEARCH: resource({ name: 'SEARCH', fetch, cacheDuration, nocache: true // don't cache requests to this API
//         url: (id, {sort, page, pageSize, hash, ...extraQueryParams}) => SEARCH.search( id, hash, sort, page, pageSize )
//     })
// }
// !! use it
// RESOURCES.PROPERTY.get(123).then(property => ... draw some React component?)
// RESOURCES.CATALOG.get(71012).then(catalog => ... draw some React component?)
// RESOURCES.LOCATION.get('Houston', 'TX', 77006).then(price => ... draw some React component?)
// !! all of the above are separate requests, but they are sent as A SINGLE REQUEST to /mux in the browser, and sent to the actual API in node
// !! you can also choose to have the browser AND node send mux'ed requests by making the fetch() just be isomorphic fetch, if the node server isn't the API server and your API sever supports it