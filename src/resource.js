import store from './store'
import cache from './cache'
import fetch from './fetch'

const resource = (config={}, defaultState={}) => {

    let inflight = {}

    const _store = store(defaultState),
        {get, getURL, parse, nocache, name, cacheDuration} = config

    const _get = (id, ...params) => {
        let _id = id

        if(_id instanceof Object)
            _id = Object.keys(_id).sort().map(k => `${k}:${_id[k]}`).join(',')
        // get an inflight Promise the resolves to the data, keyed by `id`,
        // or create a new one
        return inflight[_id] ||
            (inflight[_id] = new Promise((res,rej) =>
                cache.getItem(`${name}:${id}`)
                .then(d => res(d))
                .catch(error =>
                    (get instanceof Function ?
                        get(id, ...params) :
                        fetch(getURL(id, ...params)))
                    .then(d => !global.document && parse ? parse(d) : d)
                    .then(d => {
                        if(!d) throw `no data returned from ${name}:${_id}`
                        return d
                    })
                    .then(d =>
                        _store.dispatch((state, next) => {
                            let _state = {...state, [_id]: d} // make new state
                            inflight = {...inflight, [_id]: undefined} // clear in-flight promise
                            !nocache && cache.setItem(`${name}:${_id}`, d, cacheDuration)
                            next(_state) // store's new state is _state
                        })
                    .then(state => state[_id])) // pipe state[id] to get()
                    .then(d => res(d)) // resolve the get(id)
                    .catch(e => {
                        inflight = {...inflight, [_id]: undefined} // in case of fire...
                        rej(e)
                    }))
            ))
    }

    return {
        ...config,
        store: _store,
        get: _get
    }
}

export default resource