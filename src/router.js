// The `router()` module is a simple client-side `hashchange` event router that allows Single Page Apps to effectively map and listen to route changes. For `router()` implementation examples, see the `router.js` file.
//
// Example usage at end of this file.

export const router = (routes, routeTransform) => {
    const hashroutes = Object.keys(routes).map(route => {
        let tokens = route.match(/:(\w+)/ig),
            handler = routeTransform(routes[route])

        let regex = (tokens || []).reduce((a,v) => a.replace(v, '([^/])+'), route).replace(/(\*)/ig, '([^/])*')

        return { route, regex, handler }
    })

    // a shortcut method to changing the location hash
    const page = (path) =>
        window.location.hash = path

    // returns true if a route matches a route object, false otherwise
    const checkRoute = (hash, routeObj) => {
        hash = hash[0] === '#' ? hash.substring(1) : hash
        let {route, regex, handler} = routeObj,
            reggie = new RegExp(regex, 'ig')

        return hash.match(reggie)
    }

    // 1. handles a route change,
    // 2. checks for matching routes,
    // 3. calls just the first matchign route callback
    const handleRoute = () => {
        let matched = hashroutes.filter(obj => checkRoute(window.location.hash, obj)),
            selected = matched[0]

        if(!selected) return

        let { route, regex, handler, tokens } = selected,
            segments = window.location.hash.split('/'),
            mappedSegments = route.split('/')
                .map(segment => {
                    let match = segment.match(/(\*)|:(\w+)/ig)
                    return match && match[0]
                }),
            routeCtx = segments.reduce((a,v,i) => {
                let mappedSegment = mappedSegments[i],
                    {indices} = a

                if(!mappedSegment) return a

                if(mappedSegment[0] === ':')
                    mappedSegment = mappedSegment.substring(1)
                else if(mappedSegment[0] === '*') {
                    mappedSegment = indices
                    indices++
                }

                return {...a, [mappedSegment]: v, indices}
            }, {indices:0})

        handler(routeCtx)
    }

    window.addEventListener('hashchange', handleRoute)
    window.onload = () => handleRoute()

    return {page}
}

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