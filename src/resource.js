// The `resource()` module is a mechanism that wraps around the previous modules (`fetch()`, `cache()`, `store()`),
// exposing one primary method `get()`. Example code at end of file.


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

// !! Example usage
//
// !! isomorphic/universal usage
// const root = global.document ? window.location.origin : 'http://myapiserverurl.com'
// !! browser talks to node server, node server proxies to API
// const isomorphicfetch = require('isomorphic-fetch')
// !! muxer, that uses isomorphic fetch for transport on the client, but straight up isomorphic fetch() on node
// !! browser will send mux'ed requests to be demux'ed at '/mux'
// const fetch = global.document ? mux('/mux', isomorphicfetch) : isomorphicfetch
// const cacheDuration = 2*60*60*1000 // 2 hours
// !! url functions simply return a string, a call to resource.get(...args) will make a request to url(...args)
// !! imagine LOCATION.location() and SEARCH.search() exist and return strings, too
// const RESOURCES = {
//     PROPERTY: resource({ name: 'PROPERTY', fetch, cacheDuration,                   url: id => `props/${id}` }),
//     CATALOG: resource({ name: 'CATALOG', fetch, cacheDuration,                     url: id => `catalogs/${id}` }),
//     LOCATION: resource({ name: 'LOCATION', fetch, cacheDuration,                   url: (...args) => LOCATION.location(...args) }),
//     PRICE: resource({ name: 'PRICE', fetch, cacheDuration,                         url: id => `prices/${id}` }),
//     SEARCH: resource({ name: 'SEARCH', fetch, cacheDuration, nocache: true // don't cache requests to this API
//         url: (id, {sort, page, pageSize, hash, ...extraQueryParams}) => SEARCH.search( id, hash, sort, page, pageSize )
//     })
// }
// !! use it
// RESOURCES.PROPERTY.get(123).then(property => ... draw some React component?)
// RESOURCES.CATALOG.get(71012).then(catalog => ... draw some React component?)
// RESOURCES.LOCATION.get('Houston', 'TX', 77006).then(price => ... draw some React component?)
// !! all of the above are separate requests, but they are sent as A SINGLE REQUEST to /mux in the browser, and sent to the actual API in node
// !! you can also choose to have the browser AND node send mux'ed requests by making the fetch() just be isomorphic fetch, if the node server isn't the API server and your API sever supports it