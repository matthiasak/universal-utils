/*
monad axioms
1. unit(v).bind(f) === f(v)
2. monad.bind(unit) === monad
3. bind(bind(monad, f), g) === monad.bind(f).bind(g) === monad.bind(v => f(v).bind(g))
*/

const monad = (mod) => {
    let proto = {}

    let unit = value => {
        let monad = Object.create(proto)
        monad.bind = (fn=x=>x,...a) => fn(value,...a)
        if(mod instanceof Function) mod(monad, value)
        return monad
    }

    unit.lift = function(name,fn){
        proto[name] = function(...a){
            return unit(this.bind(fn, ...a))
        }
        return unit
    }

    return unit
}

export default monad

/*

// EXAMPLE USAGE:

let loggable = monad()
    .lift('double', a => a*2)

let x = loggable(1).double()
log(x.bind())

let maybe = monad(function(m,v) {
    if(v === null || v === undefined){
        m.is_null = true
        m.bind = () => m
    }
})

log(maybe(null).bind(x => x*2).bind())*/