'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var clone = function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
};

var storage = require('localforage');

// Force localStorage to be the backend driver.
storage.setDriver(storage.LOCALSTORAGE);

var cache = function cache() {

    var getItem = function getItem(key) {
        var expire = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        return storage.getItem(key).then(function (d) {
            if (!(d && d.data)) throw key + ' not in cache';
            var expired = expire || +new Date() > d.expiresAt;
            if (expired) throw key + ' is expired';
            return d.data;
        });
    };

    var setItem = function setItem(key, val) {
        var timeout = arguments.length <= 2 || arguments[2] === undefined ? 5 * 60 * 60 * 1000 : arguments[2];

        if (!val) return Promise.reject('val was null/undefined');
        var expiresAt = +new Date() + timeout;
        return storage.setItem(key, { expiresAt: expiresAt, data: val });
    };

    return { getItem: getItem, setItem: setItem };
};

var c = cache();
exports.default = c;

// ---- extra config options ----
// window.storage = storage
// window.cache = c
// storage.config({
//     // driver: storage.LOCALSTORAGE,
//     name: 'rentvillas'
// })