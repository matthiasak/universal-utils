/**
 * batches in-flight requests into the same request object
 */
const _fetch = f => {
    let inflight = {}

    return (url, options={}) => {
        let {method} = options

        if(method === 'post')
            return f(url, options)

        return inflight[url] ||
            (inflight[url] =
                new Promise((res,rej) => {
                    f(url, {...options, compress: false})
                    .then(r => r.text())
                    .then(text => {
                        try {
                            return JSON.parse(text)
                        } catch(e){
                            throw `${url} did not return JSON`
                        }
                    })
                    .then(d => res(d))
                })
                .then(data => {
                    inflight = {...inflight, [url]: undefined}
                    return data
                })
                .catch(e =>
                    console.error(e, url)))
    }
}

const _f = _fetch(fetch)

export default _f