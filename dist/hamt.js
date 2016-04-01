'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// simple fn that returns a map node
var node = function node() {
    var val = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

    var result = {};
    if (val) result.val = val;
    return result;
};

// compute the hamming weight
var hamweight = function hamweight(x) {
    x -= x >> 1 & 0x55555555;
    x = (x & 0x33333333) + (x >> 2 & 0x33333333);
    x = x + (x >> 4) & 0x0f0f0f0f;
    x += x >> 8;
    x += x >> 16;
    return x & 0x7f;
};

// hash fn
var hash = exports.hash = function hash(str) {
    if (typeof str !== 'string') str = JSON.stringify(str);
    var type = typeof str === 'undefined' ? 'undefined' : _typeof(str);
    if (type === 'number') return str;
    if (type !== 'string') str += '';

    var hash = 0;
    for (var i = 0, len = str.length; i < len; ++i) {
        var c = str.charCodeAt(i);
        hash = (hash << 5) - hash + c | 0;
    }
    return hash;
};

// compare two hashes
var comp = function comp(a, b) {
    return hash(a) === hash(b);
};

// get a sub bit vector
var frag = function frag() {
    var h = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var i = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var range = arguments.length <= 2 || arguments[2] === undefined ? 8 : arguments[2];
    return h >>> range * i & (1 << range) - 1;
};

// const toBitmap = x => 1 << x
// const fromBitmap = (bitmap, bit) => popcount(bitmap & (bit - 1))
var bin = function bin(x) {
    return x.toString(2);
};

// clone a node
var replicate = exports.replicate = function replicate(o, h) {
    var n = node();
    for (var x = 0, _o = o, _n = n; x < 4; x++) {
        for (var i in _o) {
            if (i !== 'val' && _o.hasOwnProperty(i)) {
                _n[i] = _o[i]; // point n[i] to o[i]
            }
        }

        var __n = node(),
            f = frag(h, x);

        _n[f] = __n;
        _n = __n;
        _o = _o[f] === undefined ? {} : _o[f];
    }
    return n;
};

var set = exports.set = function set(m, key, val) {
    var json = JSON.stringify(val),
        h = hash(key),
        n = get(m, key);

    if (n === undefined || !comp(n, val)) {
        // in deepest level (3), need to create path down to make this change
        var r = replicate(m, h); // new subtree
        for (var i = 0, _r = r; i < 4; i++) {
            _r = _r[frag(h, i)];
        }_r.val = val;
        return r;
    }

    // else the hash came out to be the same, do nothing
    return m;
};

var unset = exports.unset = function unset(m, key) {
    var h = hash(key),
        r = replicate(m, h); // new subtree
    for (var i = 0, _r = r; i < 3; i++) {
        _r = _r[frag(h, i)];
    }_r[frag(h, 3)] = undefined;
    return r;
};

var get = exports.get = function get(m, key) {
    var h = hash(key);
    for (var i = 0, _r = m; i < 4; i++) {
        _r = _r[frag(h, i)];
        if (!_r) return undefined;
    }
    return _r.val;
};

var hashmap = exports.hashmap = function hashmap() {
    var initial = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var result = node();
    for (var i in initial) {
        if (initial.hasOwnProperty(i)) result = set(result, i, initial[i]);
    }
    return result;
};

var list = exports.list = function list() {
    var initial = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    var result = node();
    for (var i = 0, len = initial.length; i < len; i++) {
        result = set(result, i, initial[i]);
    }
    return result;
};

var iter = function iter(hashmap) {
    var items = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    for (var i in hashmap) {
        if (hashmap.hasOwnProperty(i)) {
            if (i !== 'val') {
                iter(hashmap[i], items);
            } else {
                items.push(hashmap[i]);
            }
        }
    }
    return items;
};

var identity = function identity(x) {
    return x;
};

var map = exports.map = function map(hashmap) {
    var fn = arguments.length <= 1 || arguments[1] === undefined ? identity : arguments[1];
    var it = arguments.length <= 2 || arguments[2] === undefined ? iter : arguments[2];

    var items = it(hashmap),
        result = [];
    for (var i = 0, len = items.length; i < len; i++) {
        result.push(fn(items[i]));
    }
    return result;
};

var inOrder = exports.inOrder = function inOrder(hashmap) {
    var list = [],
        i = 0,
        v = void 0;

    while ((v = get(hashmap, i++)) !== undefined) {
        list.push(v);
    }

    return list;
};

var reduce = exports.reduce = function reduce(hashmap, fn, acc) {
    var it = arguments.length <= 3 || arguments[3] === undefined ? iter : arguments[3];

    var items = it(hashmap);
    acc = acc === undefined ? items.shift() : acc;
    for (var i = 0, len = items.length; i < len; i++) {
        acc = fn(acc, items[i]);
    }
    return acc;
};
/*
Usage:

let x = hashmap({'hello':1})
    , y = set(x, 'goodbye', 2)
    , z = list(Array(30).fill(true).map((x,i) => i+1))
    , a = hashmap(Array(30).fill(true).reduce((a,x,i) => {
        a[i] = i+1
        return a
    }, {}))

log(
    get(x, 'hello')+'',
    x,
    unset(x, 'hello'),
    get(x, 'goodbye')+'',
    get(y, 'hello')+'',
    get(y, 'goodbye')+'',
    x===y,
    comp(a,z),
    // map(a, x=>x+1),
    // map(z, x=>x+1),
    reduce(a, (acc,x)=>acc+x, 0),
    reduce(a, (acc,x)=>acc+x, 0)
)
*/