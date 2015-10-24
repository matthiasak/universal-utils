"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var clone = function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
};

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

var store = function store() {
    var _state2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    // might have to be changed back to Set()
    // if subscribers get garbage collected
    //
    // WeakSet and WeakMap items are GC'd if
    // they have no other reference pointing to them
    // other than the WeakMap/WeakSet
    var subscribers = new Set(),
        actions = {};

    var instance = {
        state: function state() {
            return clone(_state2);
        },
        dispatch: function dispatch(reducer) {
            var _state = arguments.length <= 1 || arguments[1] === undefined ? instance.state() : arguments[1];

            return new Promise(function (res, rej) {
                var next = function next(newState) {
                    _state2 = clone(newState);
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = subscribers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var s = _step.value;

                            s(clone(_state2));
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator["return"]) {
                                _iterator["return"]();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    res(clone(_state2));
                };
                reducer(_state, next);
            });
        },
        to: function to(sub) {
            return subscribers.add(sub);
        },
        remove: function remove(sub) {
            return subscribers["delete"](sub);
        }
    };
    return instance;
};

exports["default"] = store;

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
module.exports = exports["default"];