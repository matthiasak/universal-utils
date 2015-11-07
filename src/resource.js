import {store as _store} from './store'
import cache from './cache'
import batch from './fetch'

require('isomorphic-fetch')
const __fetch = global.fetch
const _fetch = batch(__fetch)

const resource = (config={}, defaultState={}) => {

    let inflight = {}

    const store = _store(defaultState),
        {url, fetch, parse, nocache, name, cacheDuration} = config,
        f = fetch || _fetch

    const get = (id, ...params) => {
        let _id = id

        if(_id instanceof Object)
            _id = Object.keys(_id).sort().map(k => `${k}:${_id[k]}`).join(',')
        // get an inflight Promise the resolves to the data, keyed by `id`,
        // or create a new one
        return inflight[_id] ||
            (inflight[_id] = new Promise((res,rej) =>
                (nocache ?
                    Promise.reject() :
                    cache.getItem(`${name}:${id}`))
                .then(d => res(d))
                .catch(error =>
                    f(url(id, ...params), {resourceName: name})
                    .then(d => !global.document && parse ? parse(d) : d)
                    .then(d => {
                        if(!d) throw `no data returned from ${name}:${_id}`
                        return d
                    })
                    .then(d =>
                        store.dispatch((state, next) => {
                            let _state = {...state, [_id]: d} // make new state
                            inflight = {...inflight, [_id]: undefined} // clear in-flight promise
                            !nocache && cache.setItem(`${name}:${_id}`, d, cacheDuration)
                            next(_state) // store's new state is _state
                        })
                    .then(state => state[_id])) // pipe state[id] to the call to f()
                    .then(d => res(d)) // resolve the f(url(id))
                    .catch(e => {
                        inflight = {...inflight, [_id]: undefined} // in case of fire...
                        rej(e)
                    }))
            ))
    }

    return { ...config, store, get }
}

export default resource