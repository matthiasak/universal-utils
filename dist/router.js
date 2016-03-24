'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// The `router()` module is a simple client-side `hashchange` event router that allows Single Page Apps to effectively map and listen to route changes. For `router()` implementation examples, see the `router.js` file.
//
// Example usage at end of this file.

var router = exports.router = function router(routes, routeTransform) {
    var hashroutes = Object.keys(routes).map(function (route) {
        var tokens = route.match(/:(\w+)/ig),
            handler = routeTransform(routes[route]);

        var regex = (tokens || []).reduce(function (a, v) {
            return a.replace(v, '([^/])+');
        }, route).replace(/(\*)/ig, '([^/])*');

        return { route: route, regex: regex, handler: handler };
    });

    // a shortcut method to changing the location hash
    var page = function page(path) {
        return window.location.hash = path;
    };

    // returns true if a route matches a route object, false otherwise
    var checkRoute = function checkRoute(hash, routeObj) {
        hash = hash[0] === '#' ? hash.substring(1) : hash;
        var route = routeObj.route;
        var regex = routeObj.regex;
        var handler = routeObj.handler;
        var reggie = new RegExp(regex, 'ig');

        return hash.match(reggie);
    };

    // 1. handles a route change,
    // 2. checks for matching routes,
    // 3. calls just the first matchign route callback
    var handleRoute = function handleRoute() {
        var matched = hashroutes.filter(function (obj) {
            return checkRoute(window.location.hash, obj);
        }),
            selected = matched[0];

        if (!selected) return;

        var route = selected.route;
        var regex = selected.regex;
        var handler = selected.handler;
        var tokens = selected.tokens;
        var segments = window.location.hash.split('/');
        var mappedSegments = route.split('/').map(function (segment) {
            var match = segment.match(/(\*)|:(\w+)/ig);
            return match && match[0];
        });
        var routeCtx = segments.reduce(function (a, v, i) {
            var _extends2;

            var mappedSegment = mappedSegments[i];
            var indices = a.indices;


            if (!mappedSegment) return a;

            if (mappedSegment[0] === ':') mappedSegment = mappedSegment.substring(1);else if (mappedSegment[0] === '*') {
                mappedSegment = indices;
                indices++;
            }

            return _extends({}, a, (_extends2 = {}, _defineProperty(_extends2, mappedSegment, v), _defineProperty(_extends2, 'indices', indices), _extends2));
        }, { indices: 0 });

        handler(routeCtx);
    };

    window.addEventListener('hashchange', handleRoute);
    window.onload = function () {
        return handleRoute();
    };

    return { page: page };
};

/**
 * EXAMPLE USAGE
 */

// routes input is an object map, where routes return a function
// User, Playlist, Search, and Home are React Component classes
// -------------------------------------
// const routes = {
//     'user/:id': () => User,
//     'playlist/:id': () => Playlist,
//     'search/*': () => Search,
//     '*': () => Home
// }

// when routes are handled, the routeCallback is the function/handler from the route map above,
// where any route data will be passed to the function returned by the routeTransform
//
// in this code, I optionall pulled extra data from location.search (query params like ?test=1&name=bob),
// turn it into an object with some other method unquerify(...) ---> { test: '1', name: 'bob' },
// and pass both the route options and query params as props to the React component
// -------------------------------------
// const routeTransform = (routeCallback) =>
//     (ctx) => {
//         let options = {...ctx, ...unquerify(window.location.search)}
//         ReactDOM.render(
//             <App>{React.createElement(routeCallback(), options)}</App>,
//             document.querySelector('.container')
//         )
//     }

// start the routing
// -------------------------------------
// const myRoutes = router(routes, routeTransform)