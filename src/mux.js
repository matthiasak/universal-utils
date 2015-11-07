require('isomorphic-fetch')
const iso_fetch = global.fetch
// import fetch, {batch} from './fetch'
import store from './store'

const debounce = (func, wait, timeout) =>
    (...args) => {
        const later = () => {
            timeout = null
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }

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

const muxer = (batch_url, f=iso_fetch, wait=100) => {
    const payload = store([])

    // puts url,options,id on payload
    const worker = (url, options) =>
        payload.dispatch((state, next) =>
            next([...state, {url, options}])
        ).then(state => state.length-1)

    // sends payload after `wait` ms
    const send = debounce((method='GET') =>
        f(batch_url,
            {method,body:JSON.stringify(payload.state())})
        .then(data => {
            payload.state([]) // reset payload for next batch of requests
            callbacks.forEach(cb => cb(data)) // ordered array of requests
            callbacks = []
        }), wait)

    let callbacks = []
    const queue = cb => {
        callbacks.push(cb)
        send()
    }

    return (url, options={}) =>
        // add {url,options} to payload
        // resolves to data[index] under assumption the endpoint returns
        // data in order it was requested
        worker(url, options).then(index =>
            new Promise(res =>
                queue(data =>
                    res(data[index]))))
}


export default muxer

// example
// ----------
// # mocked response from server
// const mock = (url,{body}) => {
//     return Promise.resolve(JSON.parse(body).map(({url,options:data}) => {
//         switch(url) {
//             case '/cows': return {name: 'cow', sound: 'moo', data}
//             case '/kittens': return {name: 'cat', sound: 'meow', data}
//         }
//     }))
// }
//
// # create the muxer, pass in a custom fetch
// const uberfetch = muxer('/api/mux', mock)
// uberfetch('/cows', {age: 5}).then(log)
// uberfetch('/cows', {age: 10}).then(log)
// uberfetch('/cows', {age: 15}).then(log)
// uberfetch('/cows', {age: 20}).then(log)
// uberfetch('/cows', {age: 25}).then(log)
// uberfetch('/cows', {age: 50}).then(log)
// uberfetch('/kittens').then(log)
// uberfetch('/kittens', {wantsMilk: true}).then(log)
// uberfetch('/kittens', {scratchedUpMyCouch: true}).then(log)
