const ident = x => x
const keys = o => Object.keys(o)
const bind = (f,g) => f(g())

const of = val => {
    let isNothing = () => !val
  let map = (f=ident) => {
        if(val instanceof Array)
          return isNothing() ? of([]) : of(val.map(f))

        if(typeof val === 'object')
            return isNothing() ? of({}) : of(keys(val).reduce((acc,key) =>
                ({ ...acc, [key]:f(val[key], key) }), {}))

    return isNothing() ? of(null) : of(f(val))
    }

    return {
        map,
        isNothing,
        val
    }
}

export default of

// log(
//     of({matt:1, ian:2, jeremy:3})
//   .map(x => x+1)
//     .map(x => x*3)
//     .map(x => x*5 + 10+x)
//     .map(x => x+' wha?')
// )