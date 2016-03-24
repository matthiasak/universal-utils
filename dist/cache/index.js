'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var clone = function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
};

var cacheCreator = exports.cacheCreator = function cacheCreator() {
    var REDIS_URL = process.env.REDIS_URL;


    if (REDIS_URL) {
        var _ret = function () {
            var client = require('redis').createClient(REDIS_URL);

            "ready,connect,error,reconnecting,end".split(',').map(function (event) {
                return client.on(event, function (msg) {
                    return console.log('Redis ' + event + ' :: ' + msg);
                });
            });

            var getItem = function getItem(key, expire) {
                return new Promise(function (res, rej) {
                    client.get(key, function (err, data) {
                        if (err || !data) rej(key + ' not in cache');
                        data = JSON.parse(data);
                        var expired = expire || +new Date() > data.expiresAt;
                        if (expired) rej(key + ' is expired');
                        res(data);
                    });
                });
            };

            var setItem = function setItem(key, val) {
                var timeout = arguments.length <= 2 || arguments[2] === undefined ? 5 * 60 * 60 * 1000 : arguments[2];

                var expiresAt = +new Date() + timeout;
                return new Promise(function (res, rej) {
                    client.set(key, JSON.stringify({ expiresAt: expiresAt, data: val }), function () {
                        res(val);
                    });
                });
            };

            var clearAll = function clearAll(key) {
                return new Promise(function (res, rej) {
                    client.keys(key, function () {
                        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                            args[_key] = arguments[_key];
                        }

                        return args.map(function (x) {
                            return client.del(x);
                        });
                    });

                    res();
                });
            };

            return {
                v: { getItem: getItem, setItem: setItem, clearAll: clearAll }
            };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } else {
        var _ret2 = function () {

            var cache = {};

            var getItem = function getItem(key, expire) {
                return new Promise(function (res, rej) {
                    if (key in cache) {
                        var data = clone(cache[key]),
                            expired = expire || data.expiresAt < +new Date();
                        if (expired) return rej(key + ' is expired');
                        if (!data.data) return rej(key + ' has no data');
                        return res(data.data);
                    }
                    rej(key + ' not in cache');
                });
            };

            var setItem = function setItem(key, val) {
                var timeout = arguments.length <= 2 || arguments[2] === undefined ? 5 * 60 * 60 * 1000 : arguments[2];

                var expiresAt = +new Date() + timeout;
                var data = { expiresAt: expiresAt, data: val };
                return new Promise(function (res, rej) {
                    cache[key] = clone(data);
                    res(clone(data).data);
                });
            };

            var clearAll = function clearAll(key) {
                Object.keys(cache).filter(function (n) {
                    return n.indexOf(key) !== -1;
                }).map(function (x) {
                    return delete cache[x];
                });
                return Promise.resolve();
            };

            return {
                v: { getItem: getItem, setItem: setItem, clearAll: clearAll }
            };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
    }
};

var cache = exports.cache = cacheCreator();