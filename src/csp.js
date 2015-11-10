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

const raf = cb => requestAnimationFrame ? requestAnimationFrame(cb) : setTimeout(cb,0)

const channel = (options={}) => {
    let c = [],
        channel_closed = false,
        actors = []

    const not = (c, b) => c.filter(a => a !== b),
        each = (c, fn) => c.forEach(fn),
        removeFrom = (a,b) => b.reduce((acc,v) =>
            (a.indexOf(v) === -1) ? [...acc, v] : acc, []),
        {put: _put, take: _take} = options

    const put = (...vals) => {
            _put && (vals = _put(...vals))
            c = [...vals, ...c]
            return ["park", ...c]
        },
        take = (x=1, taker=(...vals)=>vals) => {
            let _c = _take ? _take(...c).slice(0,x) : c
            _c = taker(..._c)
            let diff = _c.length - x
            if(diff < 0) return ['park']
            _take && (c = removeFrom(_c, c))
            const vals = _c.slice(_c.length-x).reverse()
            _c = _c.slice(0, _c.length-x)
            return [ vals.length !== 0 ? 'continue' : 'park', ...vals ]
        },
        awake = (run) => each(not(actors, run), a => a()),
        status = (next, actor) => {
            const {done, value} = next
            if(done) actors = not(actors, actor)
            return value || ['park']
        },
        actor = iter => {
            let prev = []
            const run = () => {
                if(channel_closed) return (actors = [])
                const [state, ...vals] = status(iter.next(prev), run)
                prev = vals
                raf((state === 'continue') ? run : cb)
            }, cb = awake.bind(null, run)
            return run
        },
        spawn = gen => {
            const _actor = actor(gen(put, take))
            actors = [...actors, _actor]
            _actor()
        }

    return {
        spawn,
        close: () => {
            channel_closed = true
        }
    }
}

/**
API

channel({ take: ?fn, put: ?fn }) optional take filter fn, and put filter fn
channel.spawn()
channel.close()
**/

/*
let x = channel({
    take: (...vals) => vals.filter(x => typeof x === 'number') // take only numbers from the channel
    // but can put dates or anything into channel
}) // create new channel()

// for any value in the channel, pull it and log it
x.spawn( function* (put, take) {
    while(true){
        let vals = yield take(1, (...vals) => vals.filter(x => x%2===0)) // if not 10 items available, actor parks, waiting to be signalled again, and also find just evens
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