'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

/**
 * batches in-flight requests into the same request object
 */
var _fetch = function _fetch(f) {
    var cache = {};
    return function (url) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var method = options.method;

        if (method === 'post') return f(url, options);

        return cache[url] || (cache[url] = new Promise(function (res, rej) {
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
            cache = _extends({}, cache, _defineProperty({}, url, undefined));
            return data;
        })['catch'](function (e) {
            return console.error(e, url);
        }));
    };
};

var _f = _fetch(fetch);

exports['default'] = _f;
module.exports = exports['default'];