'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var trim = function trim(str) {
    return str.replace(/^[\s]+/ig, '').replace(/[\s]+$/ig, '');
};

var router = exports.router = function router(routes) {
    var fn = arguments.length <= 1 || arguments[1] === undefined ? function (a, b) {
        return a(b);
    } : arguments[1];

    var current = null;

    var listen = function listen(onError) {
        window.addEventListener('hashchange', function () {
            if (!trigger(window.location.hash.slice(1))) {
                onError instanceof Function && onError(window.location.hash.slice(1));
            }
        });
    };

    var trigger = function trigger(path) {
        for (var x in routes) {
            if (routes.hasOwnProperty(x)) {
                var v = match(x, path);

                if (v) {
                    fn(routes[x], v);
                    return true;
                }
            }
        }

        return false;
    };

    var match = function match(pattern, path) {
        var _patterns = pattern.split('/'),
            parts = _patterns.map(function (x) {
            switch (x[0]) {
                case ':':
                    return '([^/]+)';
                case '*':
                    return '.*';
                default:
                    return x;
            }
        }),
            uris = path.split('/');

        for (var i = 0; i < Math.max(parts.length, uris.length); i++) {
            var p = trim(parts[i]),
                u = trim(uris[i]),
                v = null;

            if (p === '' || u === '') {
                v = p === '' && u === '';
            } else {
                v = new RegExp(p).exec(u);
            }

            if (!v) return false;
        }

        return parts.reduce(function (a, v, i) {
            if (v[0] === ':') return _extends({}, a, _defineProperty({}, v, uris[i]));
            return a;
        }, {});
    };

    return {
        add: function add(name, fn) {
            return !!(routes[name] = fn);
        },
        remove: function remove(name) {
            return !! delete routes[name] || true;
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