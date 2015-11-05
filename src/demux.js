require('isomorphic-fetch')
const iso_fetch = global.fetch
// import fetch, {batch} from './fetch'
import store from './store'

const debounce = (func, wait, immediate, timeout, p) =>
    (...args) =>
        p || new Promise(res => {
            const later = () => {
                    timeout = null
                    p = null
                    if (!immediate) res(func(...args))
                },
                callNow = immediate && !timeout

            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
            if (callNow) res(func(...args))
        })

/**
 * Muxed/Demuxed requests will involve pipelined, serialized request objects sent along together in an array.
 *
 * i.e. [
 *     {url: '...', {headers:{...}, form:{...}}},
 *     {url: '...', {headers:{...}, form:{...}}},
 *     {url: '...', {headers:{...}, form:{...}}},
 *     ...
 * ]
 */

const muxer = (batch_url, timeout=200, f=iso_fetch) => {
    let payload = store([])

        // puts url,options,id on payload
    let worker = (url, options) =>
        payload.dispatch((state, next) =>
            next(state.concat({url, options}))
            .then(state =>
                state.length-1))

        // sends payload after 200ms
    let send = debounce(() =>
        f(batch_url,
            {method:'POST',body:JSON.stringify(payload.state())})
        .then(data => {
            payload.state([]) // reset payload for next batch of requests
            return data // ordered array of requests
        }), timeout)

    return (url, options={}) =>
        // add {url,options} to payload
        // resolves to data[index] under assumption the endpoint returns
        // data in order it was requested
        worker(url, options).then(index =>
            send().then(data =>
                data[index]))
}

// example
// const logf = (...args) => log(args) || fetch(...args)
// const uberfetch = muxer('/api/mux', 200, logf)
// uberfetch('/cows')
// uberfetch('/kittens')
// ---
// logged --> [
//      "/api/mux",
//      {"method":"POST","body":"[
//      {url:'/cows', options:{}}, {url:'/kittens',options:{}}
// ]
