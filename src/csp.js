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

export const channel = () => {

    let c = [], // channel data is a queue; first in, first out
        channel_closed = false, // is channel closed?
        runners = [] // list of iterators to run through

    const not = (c, b) => c.filter(a => a !== b), // filter for "not b"
        each = (c, fn) => c.forEach(fn) // forEach...

    const put = (...vals) => { // put(1,2,3)
            c = [...vals, ...c] // inserts vals to the front of c
            return ["park", ...c] // park this iterator with this data
        },
        take = (x=1, taker=(...vals)=>vals) => { // take(numItems, mapper)
            c = taker(...c) // map/filter for certain values
            let diff = c.length - x // get the last x items
            if(diff < 0) return ['park']
            const vals = c.slice(diff).reverse() // last x items
            c = c.slice(0, diff) // remove those x items from channel
            return [ vals.length !== 0 ? 'continue' : 'park', ...vals ] // pipe dat aout from channel
        },
        awake = (run) => each(not(runners, run), a => a()), // awake other runners
        status = (next, run) => { // iterator status, runner => run others if not done
            const {done, value} = next
            if(done) runners = not(runners, run) // if iterator done, filter it out
            return value || ['park'] // return value (i.e. [state, ...nums]) or default ['park']
        },
        actor = iter => { // actor returns a runner that next()'s the iterator
            let prev = []

            const runner = () => {
                if(channel_closed)
                    return (runners = []) // channel closed? delete runners

                const [state, ...vals] =
                      status(iter.next(prev), runner) // pass values to iterator, iter.next(), and store those new vals from status()

                prev = vals; // store new vals
                // raf
                ((state === 'continue') ? runner : cb)() // if continue, keep running, else awaken all others except runner
            }

            const cb = awake.bind(null, runner) // awake all runners except runner

            return runner
        },
        spawn = gen => {
            const runner = actor(gen(put, take))
            runners = [...runners, runner]
            runner()
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

export const fromEvent = (obj, events, c=channel(), fn=e=>e) => {
    if(!obj.addEventListener) return
    if(!(typeof events === 'string') || !events.length) return
    events = events.split(',').map(x => x.trim()).forEach(x => {
        obj.addEventListener(x, e => {
            c.spawn(function* (put, take){
                yield put(fn(e))
            })
        })
    })
    return c
}

/*
let c1 = fromEvent(document.body, 'mousemove')
c1.spawn(function* (p,t){
    while(true) log(yield t(1))
})
*/

export const conj = (...channels) => {
    const x = channel(),
        send = (...vals) =>
            x.spawn(function* (p,t){ p(...vals) })

    channels.forEach(y =>
        y.spawn(function*(p,t){
            while(true){
                let [status, val] = t()
                yield (val && send(val))
            }
        }))

    return x
}

