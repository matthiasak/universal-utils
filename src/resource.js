import {default as s} from './store'
import cache from './cache'
import batch from './fetch'

require('isomorphic-fetch')
const _fetch = batch(global.fetch)

const resource = (config={}, defaultState={}) => {

    let inflight = {}

    const store = s(defaultState),
        {url, fetch, nocache, name, cacheDuration} = config,
        f = fetch || _fetch

    const get = (id, ...params) => {

        // generate a key unique to this request for muxing/batching,
        // if need be (serialized with the options)
        let _id = id
        if(_id instanceof Object)
            _id = Object.keys(_id).sort().map(k => `${k}:${id[k]}`).join(',')

        // console.log('request to:', url(id, ...params), 'with', id, params)

        // get an inflight Promise the resolves to the data, keyed by `id`,
        // or create a new one
        return inflight[_id] ||
            (inflight[_id] = new Promise((res,rej) =>
                (nocache ?
                    Promise.reject() :
                    cache.getItem(`${name}:${id}`))
                .then(d => res(d))
                .catch(error =>
                    // whatever fetching mechanism is used (batched, muxed, etc)
                    // send the resourceName, id, params with the request as options.
                    // if it is going the node server, node (when demuxing) will use the
                    // extra options to rebuild the URL
                    //
                    // in normal URL requests, we can just carry on as normal
                    f(url(id, ...params), {resourceName: name, id, params})
                    .then(d => {
                        if(!d) throw `no data returned from ${name}:${id}`
                        return d
                    })
                    .then(d =>
                        store.dispatch((state, next) => {
                            let _state = {...state, [id]: d} // make new state
                            inflight = {...inflight, [_id]: undefined} // clear in-flight promise
                            !nocache && cache.setItem(`${name}:${id}`, d, cacheDuration)
                            next(_state) // store's new state is _state
                        })
                    .then(state => state[id])) // pipe state[id] to the call to f()
                    .then(d => res(d)) // resolve the f(url(id))
                    .catch(e => {
                        inflight = {...inflight, [_id]: undefined} // in case of fire...
                        rej(e)
                    }))
            ))
    }

    return { name, store, get }
}

export default resource