export const clone = obj =>
    JSON.parse(JSON.stringify(obj))

export const eq = (a,b) => {
    if(a === undefined || b === undefined) return false
    return JSON.stringify(a) === JSON.stringify(b)
}

export const each = (arr,fn) => {
    for(var i = 0, len = arr.length; i<len; i++)
        fn(arr[i], i, arr)
}

export const map = (arr, fn) => {
    let result = []
    each(arr, (...args) => {
        result = result.concat(fn(...args))
    })
    return result
}

export const reduce = (arr, fn, acc) => {
    arr = clone(arr)
    acc = acc !== undefined ? acc : arr.shift()
    each(arr, (v,i,arr) => {
        acc = fn(acc,v,i,arr)
    })
    return acc
}

export const filter = (arr, fn) =>
    reduce(arr, (acc,v,i,arr) =>
        fn(v,i,arr) ? [...acc, v] : acc, [])

export const where = (arr, fn) =>
    filter(arr, fn)[0] || null

export const pluck = (keys=[],obj={}) =>
    reduce(
        filter(Object.keys(obj), v => keys.indexOf(v) !== -1 && !!obj[v]),
        (a,v) => { return {...a, [v]: obj[v]} },
        {}
    )

export const debounce = (func, wait) => {
    let timeout = null,
        calls = 0
    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            timeout = null
            func(...args)
        }, wait)
    }
}


export const concat = (arr, v) =>
    arr.concat([v])

export const concatAll = arr =>
    reduce(arr, (acc,v,i,arr) =>
        acc.concat(v), [])

/**
 * Function composition
 * @param ...fs functions to compose
 * @return composed function
 **/
export const compose = (...fs) =>
    (...args) =>
        fs.reduce((g, f) =>
            [f(...g)], args)[0]

/** example */
/*
const ident = x => x,
      inc = x => x+1,
      dec = x => x-1

const same = comp(inc, dec, ident)
log(same(1,2,3,4,5))
*/

export const mapping = (mapper) => // mapper: x -> y
    (reducer) => // reducer: (state, value) -> new state
        (result, value) =>
            reducer(result, mapper(value))

export const filtering = (predicate) => // predicate: x -> true/false
    (reducer) => // reducer: (state, value) -> new state
        (result, value) =>
            predicate(value) ? reducer(result, value) : result

export const concatter = (thing, value) =>
    thing.concat([value])

// example transducer usage:
// const inc = x => x+1
// const greaterThanTwo = x => x>2
// const incGreaterThanTwo = compose(
//     mapping(inc),
//     filtering(greaterThanTwo)
// )
// reduce([1,2,3,4], incGreaterThanTwo(concat), []) // => [3,4,5]

