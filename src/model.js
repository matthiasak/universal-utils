const is = (type, value) => {
    if(type && type.isValid instanceof Function){
        return type.isValid(value)
    } else if((type === String && ((value instanceof String) || typeof value === 'string'))
        || (type === Number && ((value instanceof Number) || typeof value === 'number'))
        || (type === Boolean && ((value instanceof Boolean) || typeof value === 'boolean'))
        || (type === Function && ((value instanceof Function) || typeof value === 'function'))
        || (type === Object && ((value instanceof Object) || typeof value === 'object'))
        || (type === undefined)
    ){
        return true
    }

    return false
}

const check = (types, required, data) => {
    Object.keys(types).forEach(key => {
        let t = types[key],
            value = data[key]

        if(required[key] || value !== undefined){
            if(!(t instanceof Array)) t = [t]

            let i = t.reduce((a,_type) => a || is(_type, value), false)
            if(!i) {
                throw `{${key}: ${JSON.stringify(value)}} is not one of ${t.map(x => `\n - ${x}`)}`
            }
        }
    })

    return true
}

export default const Model = (...args) => {
    let types, required, logic
    args.map(x => {
        if(x instanceof Function && !logic){ logic = x }
        else if(typeof x === 'object') {
            if(!types){ types = x }
            else if(!required){ required = x }
        }
    })

    const isValid = (data) => {
        const pipe = logic ? [check, logic] : [check]
        return pipe.reduce((a,v) => a && v(types||{},required||{},data), true)
    }

    const whenValid = (data) => new Promise((res,rej) => isValid(data) && res(data))

    return {isValid, whenValid}
}

/**
Use it


// create a Name model with required first/last,
// but optional middle
let Name = Model({
    first: String,
    middle: String,
    last: String
}, {first:true, last:true})

// create a Tags model with extra checks
let Tags = Model((types,required,data) => {
    if(!(data instanceof Array)) throw `${data} not an Array`
    data.map(x => {
        if(!is(String, x))
            throw `[${data}] contains non-String`
    })
    return true
})

// create a Price model that just has a business logic fn
let Price = Model((t,r,d) => {
    return (d instanceof Number || typeof d === 'number') && d !== 0
})

// create an Activity model with a required type and name,
// all others optional
let Activity = Model({
    type: [String, Function, Number],
    latlng: Array,//LatLng,
    title: String,
    tags: Tags,
    name: Name,
    price: Price
}, {name:true, price: true})

// create a new Activity instance, throwing errors if there are
// any invalid fields.
let a = {
    tags: ['1','2'],
    type: 1,
    name: {first:'matt',last:'keas'},
    price: 100.43,
    url: 'http://www.google.com'
}
Activity.whenValid(a).then(log).catch(e => log(e+''))
**/