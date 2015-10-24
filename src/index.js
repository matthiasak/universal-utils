const cache = require(`./cache${global.document ? '/browser.js' : ''}`)
import fetch from './fetch'
import store from './store'
import resource from './resource'

export default {cache, fetch, store, resource}