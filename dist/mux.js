'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// import fetch, {batch} from './fetch'

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

require('isomorphic-fetch');
var iso_fetch = global.fetch;

var debounce = function debounce(func, wait, timeout) {
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var later = function later() {
            timeout = null;
            func.apply(undefined, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Muxed/Demuxed requests will involve pipelined, serialized request objects sent along together in an array.
 *
 * i.e. [
 *     {url: '...', {headers:{...}, form:{...}}},
 *     {url: '...', {headers:{...}, form:{...}}},
 *     {url: '...', {headers:{...}, form:{...}}},
 *     ...
 * ]
 */

var muxer = function muxer(batch_url) {
    var f = arguments.length <= 1 || arguments[1] === undefined ? iso_fetch : arguments[1];
    var wait = arguments.length <= 2 || arguments[2] === undefined ? 100 : arguments[2];

    var payload = _store2['default']([]);

    // puts url,options,id on payload
    var worker = function worker(url, options) {
        return payload.dispatch(function (state, next) {
            return next([].concat(state, [{ url: url, options: options }]));
        }).then(function (state) {
            return state.length - 1;
        });
    };

    // sends payload after `wait` ms
    var send = debounce(function () {
        var method = arguments.length <= 0 || arguments[0] === undefined ? 'GET' : arguments[0];
        return f(batch_url, { method: method, body: JSON.stringify(payload.state()) }).then(function (data) {
            payload.state([]); // reset payload for next batch of requests
            callbacks.forEach(function (cb) {
                return cb(data);
            }); // ordered array of requests
            callbacks = [];
        });
    }, wait);

    var callbacks = [];
    var queue = function queue(cb) {
        callbacks.push(cb);
        send();
    };

    return function (url) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        return(
            // add {url,options} to payload
            // resolves to data[index] under assumption the endpoint returns
            // data in order it was requested
            worker(url, options).then(function (index) {
                return new Promise(function (res) {
                    return queue(function (data) {
                        return res(data[index]);
                    });
                });
            })
        );
    };
};

exports['default'] = muxer;

// example
// ----------
// # mocked response from server
// const mock = (url,{body}) => {
//     return Promise.resolve(JSON.parse(body).map(({url,options:data}) => {
//         switch(url) {
//             case '/cows': return {name: 'cow', sound: 'moo', data}
//             case '/kittens': return {name: 'cat', sound: 'meow', data}
//         }
//     }))
// }
//
// # create the muxer, pass in a custom fetch
// const uberfetch = muxer('/api/mux', mock)
// uberfetch('/cows', {age: 5}).then(log)
// uberfetch('/cows', {age: 10}).then(log)
// uberfetch('/cows', {age: 15}).then(log)
// uberfetch('/cows', {age: 20}).then(log)
// uberfetch('/cows', {age: 25}).then(log)
// uberfetch('/cows', {age: 50}).then(log)
// uberfetch('/kittens').then(log)
// uberfetch('/kittens', {wantsMilk: true}).then(log)
// uberfetch('/kittens', {scratchedUpMyCouch: true}).then(log)
module.exports = exports['default'];