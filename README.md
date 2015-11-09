### Universal Utils

---

[![NPM](https://nodei.co/npm/universal-utils.png)](https://nodei.co/npm/universal-utils/)
![](https://david-dm.org/matthiasak/universal-utils.svg)

Small functional problem-solving, event, state-management, and caching utilities.

- a universal caching mechanism that can cache to WebSQL, IndexedDB, or Local Storage in the browser, or to memory and redis in node
- a universal `batch()` wrapper that can batch in-flight requests to the same URL, meaning simultaneous requests to the same URL will be resolved by a single network request
- a universal "auto-batched" XMLHTTPRequest `fetch()` method that returns ES6 Promises
- a universal `mux()` wrapper that can multiplex requests from one application to another ("mux" 10 browser-side network requests into 1 request to be sent to the server)
- a universal `store()` that maintains immutable pure JSON state (**NOTE: can only have Objects and Arrays, no custom constructors stored in it**) and implements an asynchronous flux/redux pattern that can chain reducer functions together to represent state
- a universal `resource()` that fetches, batches, caches, and maintains an internal store of data associated with a particular resource / model / or API endpoint
- a small browser-side `router()` that handles `hashchange` events and maps them to callbacks

#### How to get started

1. start your own node project, then `npm i -S universal-utils`
2. this package is compiled to es5, so you don't need to worry about the Babel require hook, or anything of the sort... just do...
3. `import {cache, fetch, store, resource, router, batch, mux} from 'universal-utils'` to use this package in server or client-side

#### Changelog

- Nov 1, 2015
    - updates to build system, precompiled to es5
- Oct 22, 2015
    - project started

#### Who?

Matthew Keas, [@matthiasak](https://twitter.com/@matthiasak)

#### What and Why?

These are tiny utilities that, while limiting in API "surface area", pack a lot of punch. By having tiny modules that provide a very scoped feature, I have been able to compose wrappers and wrappers (around wrappers) which let me configure my code to an exact need and specification, all the while keeping modules testable and running at lightning speed.

Functionally-oriented programming is all the rage these days, but in this post I want to emphasize that functional programming is a subset of a more important overarching programming paradigm: compositional programming.

If you've ever used Unix pipes, you'll understand the importance and flexibility of composing small reusable programs to get powerful and emergent behaviors. Similarly, if you program functionally, you'll know how cool it is to compose a bunch of small reusable functions into a fully featured program.

#### How to learn this library

Since each file in this library is an abstraction of some sort, I will address the simplest pieces first, and then work my way up to the most complex parts. Learn how to use these utilities by following along in this order:

1. [package.json](package.json) - take a look at what libraries are installed by default when you require this package
2. [index.js](src/index.js) - everything in this repo is simply an exported module by index.js
3. [fetch.js](src/fetch.js) - learn how a single fetch() function can be used to reuse in-flight network requests to the same URL
4. [store.js](src/store.js) - learn how to make a simple "flux-like", "redux-like" event-driven store
5. [mux.js](src/mux.js) - learn how to batch requests together into a single network request, given to an API server to help multiplex chatty rpograms into fewer requests
6. [cache](src/cache) - observe the API of cache implementations... just two methods with similar signatures:

    - `getItem(key, expire=false): Promise`
    - `setItem(key, value, timeout=5*60*60*1000): Promise`

    Based on whether the browser or node is `require()`ing this folder, the API will let you cache data in WebSQL/localstorage (browser) or Redis/in-memory (node).

7. [resource.js](src/resource.js) - learn how to wrap a store, muxer, fetcher, cache, and other configurations into a universal wrapper that can automatically keep cached API requests in both the client or server.
8. [router.js](src/router.js) - The only non-universal piece of code in this repo... this is a simple routing library that can be used in lieue of larger, more verbose libraries and implementations out there like page.js or Backbone's `Backbone.Router()`.

#### License

MIT.
