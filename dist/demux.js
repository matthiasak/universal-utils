'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// import fetch, {batch} from './fetch'

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

require('isomorphic-fetch');
var iso_fetch = global.fetch;

var debounce = function debounce(func, wait, immediate, timeout, p) {
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return p || new Promise(function (res) {
            var later = function later() {
                timeout = null;
                p = null;
                if (!immediate) res(func.apply(undefined, args));
            },
                callNow = immediate && !timeout;

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) res(func.apply(undefined, args));
        });
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
    var timeout = arguments.length <= 1 || arguments[1] === undefined ? 200 : arguments[1];
    var f = arguments.length <= 2 || arguments[2] === undefined ? iso_fetch : arguments[2];

    var payload = _store2['default']([]);

    // puts url,options,id on payload
    var worker = function worker(url, options) {
        return payload.dispatch(function (state, next) {
            return next(state.concat({ url: url, options: options })).then(function (state) {
                return state.length - 1;
            });
        });
    };

    // sends payload after 200ms
    var send = debounce(function () {
        return f(batch_url, { method: 'POST', body: JSON.stringify(payload.state()) }).then(function (data) {
            payload.state([]); // reset payload for next batch of requests
            return data; // ordered array of requests
        });
    }, timeout);

    return function (url) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        return(
            // add {url,options} to payload
            // resolves to data[index] under assumption the endpoint returns
            // data in order it was requested
            worker(url, options).then(function (index) {
                return send().then(function (data) {
                    return data[index];
                });
            })
        );
    };
};

exports['default'] = muxer;

// example
// const logf = (...args) => log(args) || fetch(...args)
// const uberfetch = muxer('/api/mux', 200, logf)
// uberfetch('/cows')
// uberfetch('/kittens')
// ---
// logged --> [
//      "/api/mux",
//      {"method":"POST","body":"[
//      {url:'/cows', options:{}}, {url:'/kittens',options:{}}
// ]
module.exports = exports['default'];