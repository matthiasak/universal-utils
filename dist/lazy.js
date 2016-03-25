'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var flatten = function flatten() {
    for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
        a[_key] = arguments[_key];
    }

    return a.reduce(function (a, v) {
        if (v instanceof Array) return [].concat(_toConsumableArray(a), _toConsumableArray(flatten.apply(undefined, _toConsumableArray(v))));
        return a.concat(v);
    }, []);
};

var iter = exports.iter = function iter() {
    for (var _len2 = arguments.length, a = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        a[_key2] = arguments[_key2];
    }

    return wrap(regeneratorRuntime.mark(function _callee() {
        var b, i, len;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        b = flatten(a);
                        i = 0, len = b.length;

                    case 2:
                        if (!(i < len)) {
                            _context.next = 8;
                            break;
                        }

                        _context.next = 5;
                        return b[i];

                    case 5:
                        i++;
                        _context.next = 2;
                        break;

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
};

var seq = exports.seq = function seq() {
    var start = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var step = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
    var end = arguments[2];
    return wrap(regeneratorRuntime.mark(function _callee2() {
        var i;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        i = start;

                    case 1:
                        if (!(end === undefined || i <= end)) {
                            _context2.next = 7;
                            break;
                        }

                        _context2.next = 4;
                        return i;

                    case 4:
                        i += step;
                        _context2.next = 1;
                        break;

                    case 7:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
};

var lmap = exports.lmap = function lmap(gen, fn) {
    return wrap(regeneratorRuntime.mark(function _callee3() {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, x;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context3.prev = 3;
                        _iterator = gen()[Symbol.iterator]();

                    case 5:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context3.next = 12;
                            break;
                        }

                        x = _step.value;
                        _context3.next = 9;
                        return fn(x);

                    case 9:
                        _iteratorNormalCompletion = true;
                        _context3.next = 5;
                        break;

                    case 12:
                        _context3.next = 18;
                        break;

                    case 14:
                        _context3.prev = 14;
                        _context3.t0 = _context3['catch'](3);
                        _didIteratorError = true;
                        _iteratorError = _context3.t0;

                    case 18:
                        _context3.prev = 18;
                        _context3.prev = 19;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 21:
                        _context3.prev = 21;

                        if (!_didIteratorError) {
                            _context3.next = 24;
                            break;
                        }

                        throw _iteratorError;

                    case 24:
                        return _context3.finish(21);

                    case 25:
                        return _context3.finish(18);

                    case 26:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[3, 14, 18, 26], [19,, 21, 25]]);
    }));
};

var lfilter = exports.lfilter = function lfilter(gen, fn) {
    return wrap(regeneratorRuntime.mark(function _callee4() {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, x;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context4.prev = 3;
                        _iterator2 = gen()[Symbol.iterator]();

                    case 5:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context4.next = 13;
                            break;
                        }

                        x = _step2.value;

                        if (!fn(x)) {
                            _context4.next = 10;
                            break;
                        }

                        _context4.next = 10;
                        return x;

                    case 10:
                        _iteratorNormalCompletion2 = true;
                        _context4.next = 5;
                        break;

                    case 13:
                        _context4.next = 19;
                        break;

                    case 15:
                        _context4.prev = 15;
                        _context4.t0 = _context4['catch'](3);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context4.t0;

                    case 19:
                        _context4.prev = 19;
                        _context4.prev = 20;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 22:
                        _context4.prev = 22;

                        if (!_didIteratorError2) {
                            _context4.next = 25;
                            break;
                        }

                        throw _iteratorError2;

                    case 25:
                        return _context4.finish(22);

                    case 26:
                        return _context4.finish(19);

                    case 27:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[3, 15, 19, 27], [20,, 22, 26]]);
    }));
};

var take = exports.take = function take(gen, num) {
    return wrap(regeneratorRuntime.mark(function _callee5() {
        var it, i;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        it = gen();
                        i = 0;

                    case 2:
                        if (!(i < num)) {
                            _context5.next = 8;
                            break;
                        }

                        _context5.next = 5;
                        return it.next().value;

                    case 5:
                        i++;
                        _context5.next = 2;
                        break;

                    case 8:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));
};

var value = exports.value = function value(gen) {
    var x = [];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = gen()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var i = _step3.value;

            x.push(i);
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return x;
};

var wrap = exports.wrap = function wrap(gen) {
    var g = regeneratorRuntime.mark(function g() {
        return regeneratorRuntime.wrap(function g$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        return _context6.delegateYield(gen(), 't0', 1);

                    case 1:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, g, this);
    });
    return [value, lmap, lfilter, take].reduce(function (g, v) {
        g[fnName(v)] = v.bind(null, gen);
        return g;
    }, g);
};

var fnName = exports.fnName = function fnName(fn) {
    return (/^function (\w+)/.exec(fn + '')[1]
    );
};

// create a generator that will step through each item (finite sequence)
// let test = iter(1,2,3,4,5,6,7,8,9,10)
// log(test.value()) // accumulate the output with gen.value()
// log(value(test)) // ... or value(gen)

// ... or pass in an array, or any combination of values
// let test2 = iter(1,2,3,[4,5,6],[[7,8,9,[10]]])
// log( test2.value() )

// lazily evaluate items with lmap/lfilter
// log( lmap(test, x => x * 2).value() )
// log( lfilter(test, x => x < 7).value() )

// chain lazy operations together
// ... via traditional passing
// log( value(take(lfilter(lmap(test, x=>2*x), x=>x>=10), 2)) )
// ... or via chaining
// log( test.lmap(x=>2*x).lfilter(x => x>10).value() )

// any operation can be told to do "just enough work", or all of it
// log( test.lmap(x => 2*x).lfilter(x => x<10).value() ) // calculates 4 results, returns array of 4
// log( test.lmap(x => 2*x).value().slice(0,4) ) // calculates 10 results, returns array of 4
// log( test.lmap(x => 2*x).lfilter(x => x<10).take(2).value() ) // only calculates 2 items

// you don't have to think in finite series / arrays
// log( seq(0, 2).lmap(x => Math.pow(x,2)).take(20).value() )

// const seqFrom = fn => {
//     let g = []
//     fn(val => g.unshift(val))
//     return wrap(function*(){
//         // while(true){
//             // yield g.pop()
//         }
//     })
// }

// let mouse = seqFrom(fn =>
//     window.addEventListener('mousemove', ({screenX:x, screenY:y}) =>
//         fn([x,y])))

// log(mouse.take(100).value())