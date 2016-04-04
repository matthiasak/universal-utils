'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var router = exports.router = function router(routes) {
    var fn = arguments.length <= 1 || arguments[1] === undefined ? function (a, b) {
        return a(b);
    } : arguments[1];

    var current = null;

    var listen = function listen() {
        window.addEventListener('hashchange', function () {
            trigger(window.location.hashname.slice(1));
        });
    };

    var trigger = function trigger(path) {
        Object.keys(routes).reduce(function (a, x) {
            var v = match(x, path);
            if (v) {
                fn(routes[x], v);
                return true;
            }
            if (a) return true;
        }, false);
    };

    var match = function match(pattern, path) {
        var parts = pattern.split('/').filter(function (x) {
            return x.length;
        }),
            names = parts.reduce(function (a, x) {
            return x[0] === ':' ? [].concat(_toConsumableArray(a), [x.slice(1)]) : a;
        }, []),
            v = parts.map(function (x) {
            return x[0] === ':' ? '/([^/]+)' : '/' + x;
        }).join(''),
            results = RegExp(v).exec(path),
            parsed = (results || []).slice(1);

        return !results ? false : names.reduce(function (a, v, i) {
            return _extends({}, a, _defineProperty({}, v, parsed[i]));
        }, {});
    };

    return {
        add: function add(name, fn) {
            return !!(routes[name] = fn);
        },
        remove: function remove(name) {
            return delete routes[name] && true;
        },
        listen: listen,
        match: match,
        trigger: trigger
    };
};

// use a router inside a custom <Router> Component in React ...
// const app = () => {
//     let [React, DOM] = [react, reactDom],
//         {Component} = React

//     class Home extends Component {
//         constructor(...a){
//             super(...a)
//         }
//         render(){
//             return <div><h1>Home Screen</h1></div>
//         }
//     }

// export class Router extends Component {
//     constructor(...a){
//         super(...a)

//         let p = this.props

//         this.state = {
//             routes: p.routes || {},
//             default: p.default || '/'
//         }

//         this.router = router(this.state.routes, (el, props) => {
//             this.current = el
//         })

//         this.router.trigger(this.state.default)
//     }
//     render(){
//         return this.current()
//     }
// }

//     DOM.render(<Router routes={{
//         '/': () => <Home/>
//     }}/>, document.body)
// }

// require('react', 'react-dom').then(app)

// ... or use router outside of a React Component
// let x = router({
//     '/:x/test/:y' : ({x,y}) => log({x,y}),
//     '/': () => log('home screen')
// })

// log(x.match('/:x/test/:y', '/anything/test/anything')) // test a route pattern with a route
// x.trigger('/') // trigger the / route
// x.trigger('/hi/test/bye') // any named URI segments will be passed to the route callback