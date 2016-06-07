/*
The `fetch()` module batches in-flight requests, so if at any point in time, anywhere in my front-end or back-end application I have a calls occur to `fetch('http://api.github.com/users/matthiasak')` while another to that URL is "in-flight", the Promise returned by both of those calls will be resolved by a single network request.
*/


/**
 * batches in-flight requests into the same request object
 *
 * f should be a function with this signature:
 *
 * f: function(url,options): Promise
 */
export const batch = f => {
    let inflight = {}

    return (url, options={}) => {
        let {method} = options,
            key = `${url}:${JSON.stringify(options)}`

        if((method || '').toLowerCase() === 'post')
            return f(url, {...options, compress: false})

        return inflight[key] ||
            (inflight[key] =
                new Promise((res,rej) => {
                    f(url, {...options, compress: false})
                    .then(d => res(d))
                    .catch(e => rej(e))
                })
                .then(data => {
                    inflight = {...inflight, [key]: undefined}
                    return data
                })
                .catch(e =>
                    console.error(e, url)))
    }
}

// a simple wrapper around fetch()
// that enables a Promise to be cancelled (sort of)
// --
// use this until Promise#abort() is a method, or the WHATWG figures
// out a proper approach/implementation
require('isomorphic-fetch')
export const cancellable = f =>
    (...args) => {
        let result = f(...args),
            aborted = false

        let promise = new Promise((res,rej) => {
            result
                .then(d => aborted ? rej('aborted') : res(d))
                .catch(e => rej(e))
        })

        promise.abort = () => aborted = true

        return promise }

export const whatWGFetch = (...args) =>
    global.fetch(...args)
        .then(r => r.json())

export const cacheable = (fetch=whatWGFetch, duration=1000*60*5) => {
    let cache = {}
    return (url,opts) => {
        let c = cache[url]
        if(c && (c.timestamp + duration >= +new Date))
            return Promise.resolve(c.result)

        return fetch(url,opts).then(result => {
            cache[url] = {result, timestamp: +new Date}
            return result
        })
    }
}

export const fetch = cancellable(batch(whatWGFetch))

// !! usage
// let batching_fetcher = batch(fetch) // fetch API from require('isomorphic-fetch')
//
// !! fetch has the signature of --> function(url:string, options:{}): Promise --> which matches the spec
// !! wrapper functions for database drivers or even $.ajax could even be written to use those instead of
// !! the native fetch()
//
// let url = 'http://api.github.com/user/matthiasak',
//     log(data => console.log(data))
//
// !! the following only sends one network request, because the first request
// !! shares the same URL and would not yet have finished
//
// batching_fetcher(url).then(log) //--> {Object}
// batching_fetcher(url).then(log) //--> {Object}
//
// !! we can pass any number of options to a batched function, that does anything,
// !! as long as it returns a promise
//
// !! by default, POSTs are not batched, whereas GETs are. Clone the repo and modify to your needs.