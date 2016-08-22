'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ident = function ident(x) {
    return x;
};
var keys = function keys(o) {
    return Object.keys(o);
};
var bind = function bind(f, g) {
    return f(g());
};

var of = function of(val) {
    var isNothing = function isNothing() {
        return !val;
    };
    var map = function map() {
        var f = arguments.length <= 0 || arguments[0] === undefined ? ident : arguments[0];

        if (val instanceof Array) return isNothing() ? of([]) : of(val.map(f));

        if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') return isNothing() ? of({}) : of(keys(val).reduce(function (acc, key) {
            return _extends({}, acc, _defineProperty({}, key, f(val[key], key)));
        }, {}));

        return isNothing() ? of(null) : of(f(val));
    };

    return {
        map: map,
        isNothing: isNothing,
        val: val
    };
};

exports.default = of;

// log(
//     of({matt:1, ian:2, jeremy:3})
//   .map(x => x+1)
//     .map(x => x*3)
//     .map(x => x*5 + 10+x)
//     .map(x => x+' wha?')
// )