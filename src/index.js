import batch from './fetch'
import store from './store'
import resource from './resource'
import cache from './cache'
import router from './router'
import demux from './demux'

require('isomorphic-fetch')
const _fetch = global.fetch
const fetch = batch(_fetch)

export default {cache, fetch, store, resource, router, batch, demux}
