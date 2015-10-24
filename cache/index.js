export const clone = (obj) =>
    JSON.parse(JSON.stringify(obj))

const nodeCache = () => {

    let {REDIS_URL} = process.env

    if(REDIS_URL) {
        let client = require('redis').createClient(REDIS_URL)

        "ready,connect,error,reconnecting,end".split(',').map(event =>
            client.on(event, msg => console.log(`Redis ${event} :: ${msg}`)))

        const getItem = (key) => {
            return new Promise((res,rej) => {
                client.get(key, (err,data) =>{
                    if(err || !data) rej(`${key} not in cache`)
                    res(data)
                })
            })
        }

        const setItem = (key, val) => {
            return new Promise((res,rej) => {
                client.set(key, JSON.stringify(val), (...args) => {
                    res(val)
                })
            })
        }

        return { getItem, setItem }

    } else {

        let cache = {}

        const getItem = (key) => {
            return new Promise((res,rej) => {
                if(key in cache) return res(clone(cache[key]))
                rej(`${key} not in cache`)
            })
        }

        const setItem = (key, val) => {
            return new Promise((res,rej) => {
                cache[key] = clone(val)
                res(clone(val))
            })
        }

        return { getItem, setItem }
    }
}

const c = nodeCache()
export default c
