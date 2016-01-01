'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.muxer = undefined;

var _fetch = require('./fetch');

var _store = require('./store');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

var muxer = exports.muxer = function muxer(batch_url) {
    var f = arguments.length <= 1 || arguments[1] === undefined ? _fetch.fetch : arguments[1];
    var wait = arguments.length <= 2 || arguments[2] === undefined ? 60 : arguments[2];
    var max_buffer_size = arguments.length <= 3 || arguments[3] === undefined ? 8 : arguments[3];

    var payload = (0, _store.store)([]);

    // puts url,options,id on payload
    var worker = function worker(url, options) {
        return payload.dispatch(function (state, next) {
            return next([].concat(_toConsumableArray(state), [{ url: url, options: options }]));
        }).then(function (state) {
            return state.length - 1;
        });
    };

    var sendImmediate = function sendImmediate() {
        var cbs = callbacks;
        callbacks = [];
        var p = payload.state();
        payload.dispatch(function (state, next) {
            return next(state);
        }, []); // reset payload for next batch of requests
        f(batch_url, {
            method: 'POST',
            body: JSON.stringify(p),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(function (data) {
            return cbs.forEach(function (cb) {
                return cb(data);
            });
        }); // ordered array of requests
    };

    // sends payload after `wait` ms
    var send = debounce(sendImmediate, wait);

    var callbacks = [];
    var queue = function queue(cb) {
        callbacks.push(cb);
        // if(callbacks.length >= max_buffer_size)
        //     sendImmediate()
        // else
        send();
    };

    var get = function get(url) {
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

    return (0, _fetch.cancellable)(get);
};

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