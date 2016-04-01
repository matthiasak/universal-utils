// simple fn that returns a map node
const node = (val=undefined) => {
    let result = {}
    if(val) result.val = val
    return result
}

// compute the hamming weight
const hamweight = (x) => {
    x -= ((x >> 1) & 0x55555555)
    x = (x & 0x33333333) + ((x >> 2) & 0x33333333)
    x = (x + (x >> 4)) & 0x0f0f0f0f
    x += (x >> 8)
    x += (x >> 16)
    return (x & 0x7f)
}

// hash fn
export const hash = str => {
    if(typeof str !== 'string') str = JSON.stringify(str)
    const type = typeof str
    if (type === 'number') return str
    if (type !== 'string') str += ''

    let hash = 0
    for (let i = 0, len = str.length; i < len; ++i) {
        const c = str.charCodeAt(i)
        hash = (((hash << 5) - hash) + c) | 0
    }
    return hash
}

// compare two hashes
const comp = (a,b) => hash(a) === hash(b)

// get a sub bit vector
const frag = (h=0, i=0, range=8) =>
    (h >>> (range*i)) & ((1 << range) - 1)

// const toBitmap = x => 1 << x
// const fromBitmap = (bitmap, bit) => popcount(bitmap & (bit - 1))
const bin = x => (x).toString(2)

// clone a node
export const replicate = (o, h) => {
    let n = node()
    for(var x=0, _o=o, _n=n; x < 4; x++){
        for(let i in _o){
            if(i !== 'val' && _o.hasOwnProperty(i)){
                _n[i] = _o[i] // point n[i] to o[i]
            }
        }

        let __n = node(),
            f = frag(h, x)

        _n[f] = __n
        _n = __n
        _o = _o[f] === undefined ? {} : _o[f]
    }
    return n
}

export const set = (m, key, val) => {
    let json = JSON.stringify(val),
        h = hash(key),
        n = get(m, key)

    if((n === undefined) || !comp(n, val)){
        // in deepest level (3), need to create path down to make this change
        let r = replicate(m, h) // new subtree
        for(var i=0, _r=r; i<4; i++) _r = _r[frag(h,i)]
        _r.val = val
        return r
    }

    // else the hash came out to be the same, do nothing
    return m
}

export const unset = (m, key) => {
    let h = hash(key),
        r = replicate(m, h) // new subtree
    for(var i=0, _r=r; i<3; i++) _r = _r[frag(h,i)]
    _r[frag(h,3)] = undefined
    return r
}

export const get = (m, key) => {
    let h = hash(key)
    for(var i = 0, _r = m; i < 4; i++){
        _r = _r[frag(h,i)]
        if(!_r) return undefined
    }
    return _r.val
}

export const hashmap = (initial = {}) => {
    let result = node()
    for(let i in initial){
        if(initial.hasOwnProperty(i))
            result = set(result, i, initial[i])
    }
    return result
}

export const list = (initial = []) => {
    let result = node()
    for(let i = 0, len = initial.length; i < len; i++){
        result = set(result, i, initial[i])
    }
    return result
}

const iter = (hashmap,items=[]) => {
    for(let i in hashmap){
        if(hashmap.hasOwnProperty(i)){
            if(i !== 'val'){
                iter(hashmap[i], items)
            } else {
                items.push(hashmap[i])
            }
        }
    }
    return items
}

const identity = x=>x

export const map = (hashmap, fn=identity, it=iter) => {
    let items = it(hashmap),
        result = []
    for(let i=0,len=items.length;i<len;i++){
        result.push(fn(items[i]))
    }
    return result
}

export const inOrder = (hashmap) => {
    let list = []
        , i = 0
        , v

    while((v = get(hashmap, i++)) !== undefined){
        list.push(v)
    }

    return list
}

export const reduce = (hashmap, fn, acc, it=iter) => {
    let items = it(hashmap)
    acc = (acc === undefined) ? items.shift() : acc
    for(let i=0,len=items.length;i<len;i++){
        acc = fn(acc, items[i])
    }
    return acc
}
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