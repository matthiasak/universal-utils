const clone = (obj) => JSON.parse(JSON.stringify(obj))

/**
 *
 * Event-driven redux-like updates where we use
 * reducer functions to update a singular state object
 * contained within the store()
 *
 * Some limitations: You **must** use plain JS objects and arrays
 * with this implementation for serialization and cloning support.
 * This could eventually use actual immutable data-structures, but
 * an implementation change would be required; however if speed
 * or correctness is an issue we can try in the future, as immutable
 * libraries use data-structures like tries and the like to reduce
 * Garbage Collection and blatant in-memory copies with a "structural
 * sharing" technique.
 *
 * - state()
 * - dispatch()
 * - to()
 * - remove()
 */

const store = (state={}) => {
    // might have to be changed back to Set()
    // if subscribers get garbage collected
    //
    // WeakSet and WeakMap items are GC'd if
    // they have no other reference pointing to them
    // other than the WeakMap/WeakSet
    let subscribers = new Set(),
        actions = {}

    const instance = {
        state: () => clone(state),
        dispatch: (reducer, _state=instance.state()) =>
            new Promise((res,rej) => {
                const next = (newState) => {
                    state = clone(newState)
                    for(var s of subscribers){
                        s(clone(state))
                    }
                    res(clone(state))
                }
                reducer(_state, next)
            }),
        to: (sub) => subscribers.add(sub),
        remove: (sub) => subscribers.delete(sub)
    }
    return instance
}

export default store


/*
// Example usage:
// ----------------

let photos = store({photos:[]})
log(photos.state())

const printMe = (state) => {
    log('-------------- subscriber called', state)
}

photos.to(printMe)
photos.to(printMe) // can't have duplicate subscribers, printMe only called once per update
photos.to((state) => log('hi'))

const addRandomPhoto = (state, next) => {
    setTimeout(() => {
       state = {...state, photos: state.photos.concat('https://media0.giphy.com/media/hD52jjb1kwmlO/200w.gif')}
        next(state)
    }, 1000)
}

setInterval(() => photos.dispatch(addRandomPhoto), 500)

/// example React Component code
//
//
let update = (state) => this.setState(state)
let componentDidMount = () => {
    photos.to(update)
}
let componentWillUnmount = () => {
    photos.remove(update)
}
*/