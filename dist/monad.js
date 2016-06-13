"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/*
monad axioms
1. unit(v).bind(f) === f(v)
2. monad.bind(unit) === monad
3. bind(bind(monad, f), g) === monad.bind(f).bind(g) === monad.bind(v => f(v).bind(g))
*/

var monad = function monad(mod) {
    var proto = {};

    var unit = function unit(value) {
        var monad = Object.create(proto);
        monad.bind = function () {
            for (var _len = arguments.length, a = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                a[_key - 1] = arguments[_key];
            }

            var fn = arguments.length <= 0 || arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];
            return fn.apply(undefined, [value].concat(a));
        };
        if (mod instanceof Function) mod(monad, value);
        return monad;
    };

    unit.lift = function (name, fn) {
        proto[name] = function () {
            for (var _len2 = arguments.length, a = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                a[_key2] = arguments[_key2];
            }

            return unit(this.bind.apply(this, [fn].concat(a)));
        };
        return unit;
    };

    return unit;
};

exports.default = monad;

/*

// EXAMPLE USAGE:

let loggable = monad()
    .lift('double', a => a*2)

let x = loggable(1).double()
log(x.bind())

let maybe = monad(function(m,v) {
    if(v === null || v === undefined){
        m.is_null = true
        m.bind = () => m
    }
})

log(maybe(null).bind(x => x*2).bind())*/