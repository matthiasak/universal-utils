/*
The `fetch()` module batches in-flight requests, so if at any point in time, anywhere in my front-end or back-end application I have a calls occur to `fetch('http://api.github.com/users/matthiasak')` while another to that URL is "in-flight", the Promise returned by both of those calls will be resolved by a single network request.
*/

/**
 * batches in-flight requests into the same request object
 *
 * f should be a function with this signature:
 *
 * f: function(url,options): Promise
 */
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var batch = function batch(f) {
    var inflight = {};

    return function (url) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var method = options.method;
        var key = url + ':' + JSON.stringify(options);

        if (method === 'post') return f(url, options).then(function (r) {
            return r.text();
        }).then(function (text) {
            try {
                return JSON.parse(text);
            } catch (e) {
                throw url + ' did not return JSON';
            }
        }).then(function (d) {
            return res(d);
        });

        return inflight[key] || (inflight[key] = new Promise(function (res, rej) {
            f(url, _extends({}, options, { compress: false })).then(function (r) {
                return r.text();
            }).then(function (text) {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    throw url + ' did not return JSON';
                }
            }).then(function (d) {
                return res(d);
            })['catch'](function (e) {
                return rej(e);
            });
        }).then(function (data) {
            var _extends2;

            inflight = _extends({}, inflight, (_extends2 = {}, _extends2[key] = undefined, _extends2));
            return data;
        })['catch'](function (e) {
            return console.error(e, url);
        }));
    };
};

exports['default'] = batch;

// !! usage
// let batching_fetcher = batch(fetch) // fetch API from require('isomorphic-fetch')
//
// !! fetch has the signature of --> function(url:string, options:{}): Promise --> which matches the spec
// !! wrapper functions for database drivers or even $.ajax could even be written to use those instead of
// !! the native fetch()
//
// let url = 'http://api.github.com/user/matthiasak',
//     log(data => console.log(data))
//
// !! the following only sends one network request, because the first request
// !! shares the same URL and would not yet have finished
//
// batching_fetcher(url).then(log) //--> {Object}
// batching_fetcher(url).then(log) //--> {Object}
//
// !! we can pass any number of options to a batched function, that does anything,
// !! as long as it returns a promise
//
// !! by default, POSTs are not batched, whereas GETs are. Clone the repo and modify to your needs.
module.exports = exports['default'];