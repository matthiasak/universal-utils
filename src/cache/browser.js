const s = window.localStorage

const cache = () => {

    const getItem = (key, expire=false) => {
        const data = s.getItem(key)
        if(!d) return Promise.reject(`${key} not in cache`)
        let expired = expire || (+new Date) > d.expiresAt
        if(expired) return Promise.reject(`${key} is expired`)
        return Promise.resolve(JSON.parse(d.data))
    }

    const setItem = (key, data, timeout=5*60*60*1000, expiresAt=(+new Date + timeout)) => {
        if(!data) return Promise.reject(`data being set on ${key} was null/undefined`)
        return new Promise((res,rej) => {
            try{
                s.setItem(key, JSON.stringify({expiresAt, data}))
                res(true)
            }catch (e){
                rej(`key ${key} has a value of ${val}, which can't be serialized`)
            }
        })
    }

    const clearAll = key => {
        if(!key)
            s.clear()
        for(var i in s){
            if((!key || i.indexOf(key) !== -1) && localstorage.hasOwnProperty(i))
                s.removeItem(i)
        }
        return Promise.resolve(true)
    }

    return { getItem, setItem, clearAll }
}

const c = cache()
export default c
