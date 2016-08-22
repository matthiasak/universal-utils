const ident = x => x
const keys = o => Object.keys(o)
const bind = (f,g) => f(g())

const of = val => {
    let isNothing = !val
  let map = (f=ident) => {
        if(val instanceof Array)
          return isNothing ? of([]) : of(val.filter(x => !x.isNothing).map(f))

        if(val && typeof val === 'object')
            return isNothing ?
                of({}) :
              of(keys(val).reduce((acc,key) =>
                    ({ ...acc, [key]:f(val[key], key) }), {}))

    return isNothing ? of(null) : of(f(val))
    }

    return {
        map,
        isNothing,
        val
    }
}

export default of

// log(
//     of(null)
//   .map(x => x+1)
//   .map(x => x*3)
//   .map(x => x*5 + 10+x)
//   .map(x => x+' wha?')
//   .val+''
// )

// log(
//     of([1,2,3])
//   .map(x => x+1)
//   .map(x => x*3)
//   .map(x => x*5 + 10+x)
//   .map(x => x+' wha?')
//   .val+''
// )

// log(
//     of({matt:28, ian:30, jeremy: 37})
//   .map(x => x+1)
//   .map(x => x*3)
//   .map(x => x*5 + 10+x)
//   .map(x => x+' wha?')
//   .val
// )