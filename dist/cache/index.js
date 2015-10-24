'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var clone = function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
};

var nodeCache = function nodeCache() {
    var REDIS_URL = process.env.REDIS_URL;

    if (REDIS_URL) {
        var _ret = (function () {
            var client = require('redis').createClient(REDIS_URL);

            "ready,connect,error,reconnecting,end".split(',').map(function (event) {
                return client.on(event, function (msg) {
                    return console.log('Redis ' + event + ' :: ' + msg);
                });
            });

            var getItem = function getItem(key) {
                return new Promise(function (res, rej) {
                    client.get(key, function (err, data) {
                        if (err || !data) rej(key + ' not in cache');
                        res(data);
                    });
                });
            };

            var setItem = function setItem(key, val) {
                return new Promise(function (res, rej) {
                    client.set(key, JSON.stringify(val), function () {
                        res(val);
                    });
                });
            };

            return {
                v: { getItem: getItem, setItem: setItem }
            };
        })();

        if (typeof _ret === 'object') return _ret.v;
    } else {
        var _ret2 = (function () {

            var cache = {};

            var getItem = function getItem(key) {
                return new Promise(function (res, rej) {
                    if (key in cache) return res(clone(cache[key]));
                    rej(key + ' not in cache');
                });
            };

            var setItem = function setItem(key, val) {
                return new Promise(function (res, rej) {
                    cache[key] = clone(val);
                    res(clone(val));
                });
            };

            return {
                v: { getItem: getItem, setItem: setItem }
            };
        })();

        if (typeof _ret2 === 'object') return _ret2.v;
    }
};

var c = nodeCache();
exports['default'] = c;
module.exports = exports['default'];