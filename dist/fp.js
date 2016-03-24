"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var clone = exports.clone = function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
};

var eq = exports.eq = function eq(a, b) {
    if (a === undefined || b === undefined) return false;
    return JSON.stringify(a) === JSON.stringify(b);
};

var each = exports.each = function each(arr, fn) {
    for (var i = 0, len = arr.length; i < len; i++) {
        fn(arr[i], i, arr);
    }
};

var map = exports.map = function map(arr, fn) {
    var result = [];
    each(arr, function () {
        result = result.concat(fn.apply(undefined, arguments));
    });
    return result;
};

var reduce = exports.reduce = function reduce(arr, fn, acc) {
    arr = clone(arr);
    acc = acc !== undefined ? acc : arr.shift();
    each(arr, function (v, i, arr) {
        acc = fn(acc, v, i, arr);
    });
    return acc;
};

var filter = exports.filter = function filter(arr, fn) {
    return reduce(arr, function (acc, v, i, arr) {
        return fn(v, i, arr) ? [].concat(_toConsumableArray(acc), [v]) : acc;
    }, []);
};

var where = exports.where = function where(arr, fn) {
    return filter(arr, fn)[0] || null;
};

var pluck = exports.pluck = function pluck() {
    var keys = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var obj = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    return reduce(filter(Object.keys(obj), function (v) {
        return keys.indexOf(v) !== -1 && !!obj[v];
    }), function (a, v) {
        return _extends({}, a, _defineProperty({}, v, obj[v]));
    }, {});
};

var debounce = exports.debounce = function debounce(func, wait) {
    var timeout = null,
        calls = 0;
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            func.apply(undefined, args);
        }, wait);
    };
};

var concat = exports.concat = function concat(arr, v) {
    return arr.concat([v]);
};

var concatAll = exports.concatAll = function concatAll(arr) {
    return reduce(arr, function (acc, v, i, arr) {
        return acc.concat(v);
    }, []);
};

/**
 * Function composition
 * @param ...fs functions to compose
 * @return composed function
 **/
var compose = exports.compose = function compose() {
    for (var _len2 = arguments.length, fs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        fs[_key2] = arguments[_key2];
    }

    return function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return fs.reduce(function (g, f) {
            return [f.apply(undefined, _toConsumableArray(g))];
        }, args)[0];
    };
};

/** example */
/*
const ident = x => x,
      inc = x => x+1,
      dec = x => x-1

const same = comp(inc, dec, ident)
log(same(1,2,3,4,5))
*/

var mapping = exports.mapping = function mapping(mapper) {
    return (// mapper: x -> y
        function (reducer) {
            return (// reducer: (state, value) -> new state
                function (result, value) {
                    return reducer(result, mapper(value));
                }
            );
        }
    );
};

var filtering = exports.filtering = function filtering(predicate) {
    return (// predicate: x -> true/false
        function (reducer) {
            return (// reducer: (state, value) -> new state
                function (result, value) {
                    return predicate(value) ? reducer(result, value) : result;
                }
            );
        }
    );
};

var concatter = exports.concatter = function concatter(thing, value) {
    return thing.concat([value]);
};

// example transducer usage:
// const inc = x => x+1
// const greaterThanTwo = x => x>2
// const incGreaterThanTwo = compose(
//     mapping(inc),
//     filtering(greaterThanTwo)
// )
// reduce([1,2,3,4], incGreaterThanTwo(concat), []) // => [3,4,5]