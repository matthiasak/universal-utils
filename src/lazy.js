const flatten = (...a) =>
    a.reduce((a,v) => {
        if(v instanceof Array)
            return [...a, ...flatten(...v)]
        return a.concat(v)
    }, [])

export const iter = (...a) =>
    wrap(function*(){
        let b = flatten(a)
        for(let i = 0, len = b.length; i<len; i++)
            yield b[i]
    })

export const seq = (start=0, step=1, end) =>
    wrap(function*(){
        let i = start
        while(end === undefined || i <= end){
            yield i
            i += step
        }
    })

export const lmap = (gen, fn) =>
    wrap(function*(){
        for(let x of gen())
            yield fn(x)
    })

export const lfilter = (gen, fn) =>
    wrap(function*(){
        for(let x of gen()) {
            if(fn(x)) yield x
        }
    })

export const take = (gen, num) =>
    wrap(function*(){
        let it = gen()
        for(let i = 0; i<num; i++){
            yield it.next().value
        }
    })

export const value = gen => {
    let x = []
    for(let i of gen())
        x.push(i)
    return x
}

export const wrap = gen => {
    let g = function*(){
        yield* gen()
    }
    return [value,lmap,lfilter,take].reduce((g,v) => {
        g[fnName(v)] = v.bind(null, gen)
        return g
    }, g)
}

export const fnName = fn =>
    /^function (\w+)/.exec(fn+'')[1]

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