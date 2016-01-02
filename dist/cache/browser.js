'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var s = window.localStorage;

var cacheCreator = exports.cacheCreator = function cacheCreator() {

    var getItem = function getItem(key) {
        var expire = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        try {
            var data = JSON.parse(s.getItem(key));
            if (!data || !data.data) throw 'not in cache';
            var expired = expire || +new Date() > data.expiresAt;
            if (expired) return Promise.reject(key + ' is expired');
            return Promise.resolve(data.data);
        } catch (e) {
            return Promise.reject(key + ' not in cache');
        }
    };

    var setItem = function setItem(key, data) {
        var timeout = arguments.length <= 2 || arguments[2] === undefined ? 5 * 60 * 60 * 1000 : arguments[2];
        var expiresAt = arguments.length <= 3 || arguments[3] === undefined ? +new Date() + timeout : arguments[3];

        if (!data) return Promise.reject('data being set on ' + key + ' was null/undefined');
        return new Promise(function (res, rej) {
            try {
                s.setItem(key, JSON.stringify({ expiresAt: expiresAt, data: data }));
                res(true);
            } catch (e) {
                rej('key ' + key + ' has a value of ' + val + ', which can\'t be serialized');
            }
        });
    };

    var clearAll = function clearAll(key) {
        if (!key) s.clear();
        for (var i in s) {
            if ((!key || i.indexOf(key) !== -1) && localstorage.hasOwnProperty(i)) s.removeItem(i);
        }
        return Promise.resolve(true);
    };

    return { getItem: getItem, setItem: setItem, clearAll: clearAll };
};

var cache = exports.cache = cacheCreator();