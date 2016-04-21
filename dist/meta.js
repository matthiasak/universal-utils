"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mixin = exports.mixin = function mixin() {
    for (var _len = arguments.length, classes = Array(_len), _key = 0; _key < _len; _key++) {
        classes[_key] = arguments[_key];
    }

    var _mixin = function _mixin() {
        _classCallCheck(this, _mixin);
    };

    var proto = _mixin.prototype;

    classes.map(function (_ref) {
        var p = _ref.prototype;

        Object.getOwnPropertyNames(p).map(function (key) {
            var oldFn = proto[key] || function () {};
            proto[key] = function () {
                oldFn.apply(undefined, arguments);
                return p[key].apply(p, arguments);
            };
        });
    });

    return _mixin;
};