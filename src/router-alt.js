const trim = str => str.replace(/^[\s]+/ig, '').replace(/[\s]+$/ig, '')

export const router = (routes, fn=(a,b)=>a(b)) => {
    let current = null

    const listen = (onError) => {
        window.addEventListener('hashchange', () => {
            if(!trigger(window.location.hash.slice(1))){
                (onError instanceof Function) && onError(window.location.hash.slice(1))
            }
        })
    }

    const trigger = path => {
        for(let x in routes){
            if(routes.hasOwnProperty(x)){
                let v = match(x,path)
                if(v){
                    fn(routes[x], v)
                    return true
                }
            }
        }

        return false
    }

    const match = (pattern, path) => {
        let _patterns = pattern.split('/'),
            parts = _patterns.map(x => {
                switch(x[0]){
                    case ':': return '([^/]+)'
                    case '*': return '.*'
                    default: return x
                }
            }),
            uris = path.split('/')

        for(var i = 0; i < Math.max(parts.length, uris.length); i++){
            let p = trim(parts[i]),
                u = trim(uris[i]),
                v = null

            if(p === '' || u === ''){
                v = p === '' && u === ''
            } else {
                v = new RegExp(p).exec(u)
            }

            if(!v) return false
        }

        return parts.reduce((a,v,i) => {
            if(v[0] === ':')
                return {...a, [v]: uris[i]}
            return a
        }, {})
    }

    return {
        add: (name, fn) => !!(routes[name] = fn),
        remove: name => !!(delete routes[name]) || true,
        listen,
        match,
        trigger
    }
}

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