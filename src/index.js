require('isomorphic-fetch')

import store from './store'
import resource from './resource'
import cache from './cache'
import fetcher from './fetcher'
import router from './router'

export default {cache, fetch, store, resource, fetcher, router}