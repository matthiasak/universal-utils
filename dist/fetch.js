'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('isomorphic-fetch');
var fetch = global.fetch;

/**
 * batches in-flight requests into the same request object
 */
var _fetch = function _fetch(f) {
    var inflight = {};

    return function (url) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var method = options.method;

        if (method === 'post') return f(url, options);

        return inflight[url] || (inflight[url] = new Promise(function (res, rej) {
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
            });
        }).then(function (data) {
            var _extends2;

            inflight = _extends({}, inflight, (_extends2 = {}, _extends2[url] = undefined, _extends2));
            return data;
        })['catch'](function (e) {
            return console.error(e, url);
        }));
    };
};

var _f = _fetch(fetch);

exports['default'] = _f;
module.exports = exports['default'];