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

'use strict';

var raf = function raf(cb) {
    return requestAnimationFrame ? requestAnimationFrame(cb) : setTimeout(cb, 0);
};

var channel = function channel() {
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
            return a.indexOf(v) === -1 ? [].concat(acc, [v]) : acc;
        }, []);
    };

    var put = function put() {
        for (var _len = arguments.length, vals = Array(_len), _key = 0; _key < _len; _key++) {
            vals[_key] = arguments[_key];
        }

        c = [].concat(vals, c);
        return ["park"].concat(c);
    },
        take = function take() {
        var x = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
        var taker = arguments.length <= 1 || arguments[1] === undefined ? function () {
            for (var _len2 = arguments.length, vals = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                vals[_key2] = arguments[_key2];
            }

            return vals;
        } : arguments[1];
        return (function () {
            c = taker.apply(undefined, c);
            var diff = c.length - x;
            if (diff < 0) return ['park'];
            var vals = c.slice(c.length - x).reverse();
            c = c.slice(0, c.length - x);
            return [vals.length !== 0 ? 'continue' : 'park'].concat(vals);
        })();
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

            var state = _status[0];

            var vals = _status.slice(1);

            prev = vals;
            raf(state === 'continue' ? run : cb);
        },
            cb = awake.bind(null, run);
        return run;
    },
        spawn = function spawn(gen) {
        var _actor = actor(gen(put, take));
        actors = [].concat(actors, [_actor]);
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
        let vals = yield take(1, (...vals) =>
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