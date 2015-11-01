require('isomorphic-fetch')
let fetch = global.fetch
import store from './store'
import resource from './resource'
import cache from './cache'
import router from './router'

export default {cache, fetch, store, resource, router}