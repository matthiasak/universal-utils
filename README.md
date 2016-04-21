### Universal Utils

---

[![NPM](https://nodei.co/npm/universal-utils.png)](https://nodei.co/npm/universal-utils/)
![](https://david-dm.org/matthiasak/universal-utils.svg)

Small functional problem-solving, event, state-management, and caching utilities.

#### How to get started

1. start your own node project, then `npm i -S universal-utils`
2. this package is compiled to es5, so you don't need to worry about the Babel require hook, or anything of the sort... just do...
3. `import * as utils from 'universal-utils'` to use this package in server or client-side

#### Who?

Matthew Keas, [@matthiasak](https://twitter.com/@matthiasak)

#### What and Why?

These are **tiny** utilities that limit API "surface area" yet __pack a lot of punch__. Each of them represents a use-case from popular libraries, but condensed into very modular, reusable parts.

By having tiny modules that provide a highly scoped feature-set, I have been able to compose and reuse elements of functional programming, and create and abstract wrappers around functions, and wrappers around other wrappers. This lets me configure my code to an exact need and specification, all the while keeping modules testable and running at lightning speed.

Functionally-oriented code is all the rage these days, but in this post I want to emphasize that functional programming is a subset of a more important overarching programming paradigm: compositional programming.

If you've ever used Unix pipes, you'll understand the importance and flexibility of composing small reusable programs to get powerful and emergent behaviors. Similarly, if you program functionally, you'll know how cool it is to compose a bunch of small reusable functions into a fully featured program.

#### How to learn this dictionary of microlibs

Since each file in this library is an abstraction of some sort, I will address the simplest pieces first, and then work my way up to the most complex parts. Learn how to use these utilities by following along in this order:

1. [package.json](package.json) - take a look at what libraries are installed by default when you require this package.
2. [index.js](src/index.js) - everything in this repo is simply an exported module by index.js.
3. [fetch.js](src/fetch.js) - learn how a single `fetch()` function can be used to reuse in-flight network requests to the same URL.
4. [store.js](src/store.js) - a universal `store()` that maintains immutable pure JSON state (**NOTE: can only have Objects and Arrays, no custom constructors stored in it**) and implements an asynchronous flux/redux pattern that can chain reducer functions together to represent state; learn how to make a simple "flux-like", "redux-like" event-driven `store()`.
5. [mux.js](src/mux.js) - a universal `mux()` wrapper that can multiplex requests from one application to another ("mux" 10 browser-side network requests into 1 request to be sent to the server); learn how to batch requests together into a single network request, given to an API server to help multiplex chatty programs into fewer requests.
6. [cache](src/cache) - observe the API of cache implementations... just two methods with similar signatures:

    - `getItem(key, expire=false): Promise`
    - `setItem(key, value, timeout=5*60*60*1000): Promise`

    Based on whether the browser or node is `require()`ing this folder, the API will let you cache data in WebSQL/localstorage (browser) or Redis/in-memory (node).

7. [resource.js](src/resource.js) - learn how to wrap a store, muxer, fetcher, cache, and other configurations into a universal wrapper that can automatically keep cached API requests in both the client or server.
8. [router-alt.js](src/router-alt.js) - This is a simple routing library that can be used in lieue of larger, more verbose libraries and implementations out there like page.js or Backbone's `Backbone.Router()`. See also [router.js](src/router.js), an older version.
9. [csp.js](src/csp.js) - learn how to use a simple `channel()` implementation for using simple go-like coroutines that can `put()` and `take()` values into and out of the channel.
10. [fp.js](src/fp.js) - learn about some more functional-esque approaches to problem solving, including the use of transducers.
11. [vdom.js](src/vdom.js) - learn about an ultra tiny, minimal weight and shallow API VDOM implementation.
12. [ot.js](src/ot.js) - learn how to share and apply micro-transforms as chronological changes b/w multiple data sources (i.e. build live editors like Google Docs). Combine this "opchain" engine with channels, and you can have 'over-the-wire' live editing much like Google Docs provides.
13. [hamt.js](src/hamt.js) - learn about Hash Array Mapped Tries and persistent data structures in this ultra-minimal implementation of `list`'s and `hashmap`'s with a backing persistent data structure.
14. [model.js](src/model.js) - learn about building a rules-based, or constructor/type-based engine that validates deeply-nested data structures that follow a certain pattern. Basically, an ORM that validates Plain Old Javascript Objects.
15. [meta.js](src/meta.js) - learn about programming certain methods that are focused on metaprogramming – functions that manipulate or alter your own code, such as a `mixin()` function that can build mixins for an ES6 `class`.

#### License

MIT.
