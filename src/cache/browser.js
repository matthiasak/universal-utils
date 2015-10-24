const clone = (obj) =>
    JSON.parse(JSON.stringify(obj))

const storage = require('localforage')

const cache = () => {

    const getItem = (key) => {
        return storage.getItem(key).then(d => {
            if(!d) throw `${key} not in cache`
            let expired = (+new Date) > d.expiresAt
            if(expired) throw `${key} is expired`
            return d.data
        })
    }

    const setItem = (key, val, timeout=5*60*60*1000) => {
        const expiresAt = +new Date + timeout
        return storage.setItem(key, {expiresAt, data:val})
    }

    return { getItem, setItem }
}

const c = cache()
export default c

// ---- extra config options ----
// window.storage = storage
// window.cache = c
// storage.config({
//     // driver: storage.LOCALSTORAGE,
//     name: 'rentvillas'
// })