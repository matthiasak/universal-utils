'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Welcome to CSP in JS!
 *
 * This is an implementation of Go-style coroutines that access a hidden,
 * shared channel for putting data into, and taking it out of, a system.
 *
 * Channels, in this case, can be a set (for unique values), an array
 * (as a stack or a queue), or even some kind of persistent data structure.
 *
 * CSP (especially in functional platforms like ClojureScript, where the
 * `core.async` library provides asynchronous, immutable data-structures)
 * typically operates through two operations (overly simplified here):
 *
 * (1) put(...a) : put a list of items into the channel
 * (2) take(x) : take x items from the channel
 *
 * This implementation uses ES6 generators (and other ES6 features), which are basically functions that
 * can return more than one value, and pause after each value yielded.
 *
 *
 */

var raf = function raf(cb) {
    return requestAnimationFrame ? requestAnimationFrame(cb) : setTimeout(cb, 0);
};

var channel = exports.channel = function channel() {
    var c = [],
        channel_closed = false,
        actors = [];

    var not = function not(c, b) {
        return c.filter(function (a) {
            return a !== b;
        });
    },
        each = function each(c, fn) {
        return c.forEach(fn);
    },
        removeFrom = function removeFrom(a, b) {
        return b.reduce(function (acc, v) {
            return a.indexOf(v) === -1 ? [].concat(_toConsumableArray(acc), [v]) : acc;
        }, []);
    };

    var put = function put() {
        for (var _len = arguments.length, vals = Array(_len), _key = 0; _key < _len; _key++) {
            vals[_key] = arguments[_key];
        }

        c = [].concat(vals, _toConsumableArray(c));
        return ["park"].concat(_toConsumableArray(c));
    },
        take = function take() {
        var x = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
        var taker = arguments.length <= 1 || arguments[1] === undefined ? function () {
            for (var _len2 = arguments.length, vals = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                vals[_key2] = arguments[_key2];
            }

            return vals;
        } : arguments[1];

        c = taker.apply(undefined, _toConsumableArray(c));
        var diff = c.length - x;
        if (diff < 0) return ['park'];
        var vals = c.slice(c.length - x).reverse();
        c = c.slice(0, c.length - x);
        return [vals.length !== 0 ? 'continue' : 'park'].concat(_toConsumableArray(vals));
    },
        awake = function awake(run) {
        return each(not(actors, run), function (a) {
            return a();
        });
    },
        status = function status(next, actor) {
        var done = next.done;
        var value = next.value;

        if (done) actors = not(actors, actor);
        return value || ['park'];
    },
        actor = function actor(iter) {
        var prev = [];
        var run = function run() {
            if (channel_closed) return actors = [];

            var _status = status(iter.next(prev), run);

            var _status2 = _toArray(_status);

            var state = _status2[0];

            var vals = _status2.slice(1);

            prev = vals;
            raf(state === 'continue' ? run : cb);
        },
            cb = awake.bind(null, run);
        return run;
    },
        spawn = function spawn(gen) {
        var _actor = actor(gen(put, take));
        actors = [].concat(_toConsumableArray(actors), [_actor]);
        _actor();
    };

    return {
        spawn: spawn,
        close: function close() {
            channel_closed = true;
        }
    };
};

/**
API

channel()
channel.spawn(*function(put, take){...}) -- takes a generator that receives a put and take function
channel.close() -- closes the channel, stops all operations and reclaims memory (one line cleanup!!)
**/

/*
let x = channel() // create new channel()

// for any value in the channel, pull it and log it
x.spawn( function* (put, take) {
    while(true){
        let [status, ...vals] = yield take(1, (...vals) =>
            vals.filter(x =>
                typeof x === 'number' && x%2===0))
            // if not 10 items available, actor parks, waiting to be signalled again, and also find just evens

        if(vals.length === 1) log(`-------------------taking: ${vals}`)
    }
})

// put each item in fibonnaci sequence, one at a time
x.spawn( function* (put, take) {
    let [x, y] = [0, 1],
        next = x+y

    for(var i = 0; i < 30; i++) {
        next = x+y
        log(`putting: ${next}`)
        yield put(next)
        x = y
        y = next
    }
})

// immediately, and every .5 seconds, put the date/time into channel
x.spawn(function* insertDate(p, t) {
    while(true){
        yield p(new Date)
    }
})

// close the channel and remove all memory references. Pow! one-line cleanup.
setTimeout(() => x.close(), 2500)
*/

var fromEvent = exports.fromEvent = function fromEvent(obj, events) {
    var c = arguments.length <= 2 || arguments[2] === undefined ? channel() : arguments[2];
    var fn = arguments.length <= 3 || arguments[3] === undefined ? function (e) {
        return e;
    } : arguments[3];

    if (!obj.addEventListener) return;
    if (!(typeof events === 'string') || !events.length) return;
    events = events.split(',').map(function (x) {
        return x.trim();
    }).forEach(function (x) {
        obj.addEventListener(x, function (e) {
            c.spawn(regeneratorRuntime.mark(function _callee(put, take) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return put(fn(e));

                            case 2:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        });
    });
    return c;
};

/*
let c1 = fromEvent(document.body, 'mousemove')
c1.spawn(function* (p,t){
    while(true) log(yield t(1))
})
*/

var conj = exports.conj = function conj() {
    for (var _len3 = arguments.length, channels = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        channels[_key3] = arguments[_key3];
    }

    var x = channel(),
        send = function send() {
        for (var _len4 = arguments.length, vals = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            vals[_key4] = arguments[_key4];
        }

        return x.spawn(regeneratorRuntime.mark(function _callee2(p, t) {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            p.apply(undefined, vals);
                        case 1:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));
    };

    channels.forEach(function (y) {
        return y.spawn(regeneratorRuntime.mark(function _callee3(p, t) {
            var _t, _t2, status, val;

            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!true) {
                                _context3.next = 9;
                                break;
                            }

                            _t = t();
                            _t2 = _slicedToArray(_t, 2);
                            status = _t2[0];
                            val = _t2[1];
                            _context3.next = 7;
                            return val && send(val);

                        case 7:
                            _context3.next = 0;
                            break;

                        case 9:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));
    });

    return x;
};