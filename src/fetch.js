/**
 * batches in-flight requests into the same request object
 */
const batch = f => {
    let inflight = {}

    return (url, options={}) => {
        let {method} = options,
            key = `${url}:${JSON.stringify(options)}`

        if(method === 'post')
            return f(url, options)
                .then(r => r.text())
                .then(text => {
                    try { return JSON.parse(text) } catch(e) {
                        throw `${url} did not return JSON`
                    }
                })
                .then(d => res(d))

        return inflight[key] ||
            (inflight[key] =
                new Promise((res,rej) => {
                    f(url, {...options, compress: false})
                    .then(r => r.text())
                    .then(text => {
                        try { return JSON.parse(text) } catch(e) {
                            throw `${url} did not return JSON`
                        }
                    })
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

export default batch
