const pool = () => {
    let pool = []

    const get = () => {
        return pool.length ? pool.shift() : {}
    }

    const recycle = (obj) => {
        Object.keys(obj).forEach(k => delete obj[k])
        pool.push(obj)
    }

    return {get, recycle}
}

const POOL = pool()

const simpleRenderingMode = false

const class_id_regex = () => {
        return /[#\.][^#\.]+/ig
    },
    tagName_regex = () => {
        return /^([^\.#]+)\b/i
    }

const parseSelector = s => {
    let test = null,
        tagreg = tagName_regex().exec(s),
        tag = tagreg && tagreg.slice(1)[0],
        reg = class_id_regex(),
        vdom = POOL.get()

    if(tag) s = s.substr(tag.length)
    vdom.className = ''
    vdom.tag = tag || 'div'

    while((test = reg.exec(s)) !== null){
        test = test[0]
        if(test[0] === '.')
            vdom.className = (vdom.className+' '+test.substr(1)).trim()
        else if(test[0] === '#')
            vdom.id = test.substr(1)
    }
    return vdom
}

const debounce = (func, wait, immediate, timeout) =>
    (...args) => {
        let later = () => {
            timeout = null
            !immediate && func(...args)
        }
        var callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait || 200)
        callNow && func(...args)
    }

export const m = (selector, attrs=POOL.get(), ...children) => {
    if(attrs.tag || !(attrs instanceof Object) || attrs instanceof Array || attrs instanceof Function){
        if(attrs instanceof Array) children.unshift(...attrs)
        else children.unshift(attrs)
        attrs = POOL.get()
    }
    let vdom = parseSelector(selector)
    if(children.length)
        vdom.children = children
    vdom.attrs = attrs
    vdom.unload = attrs.unload
    delete attrs.unload
    return vdom
}

const reservedAttrs = ['className','id']
export const html = vdom => {
    if(vdom instanceof Array) return vdom.map(c => html(c)).join(' ')
    if(!(vdom instanceof Object) || (Object.getPrototypeOf(vdom) !== Object.prototype)) return vdom

    const {tag, id, className, attrs, children} = vdom,
        _id = `id="${(id || attrs.id || '')}"`,
        _class = `class="${((className||'') + ' ' + (attrs.className||'')).trim()}"`
    const closing = children ? `${children.map(c => html(c)).join(' ')}</${tag}>` : ''
    // TODO: figure out wtf todo here?
    // maybe just never use these, only use html() on server rendering?
    const events = stripEvents(vdom)
    const _attrs = Object.keys(attrs || POOL.get())
        .filter(x => reservedAttrs.indexOf(x) === -1)
        .reduce((a,v,i,arr) => `${a} ${v}="${attrs[v]}"`,'')

    POOL.recycle(vdom)

    return `<${tag} ${_id} ${_class} ${_attrs} ${!children ? '/' : ''}>${closing}`
}

export const rAF =
      global.document &&
      (requestAnimationFrame ||
      webkitRequestAnimationFrame ||
      mozRequestAnimationFrame) ||
      (cb => setTimeout(cb, 16.6))

// creatign html, strip events from DOM element... for now just deleting
const stripEvents = ({attrs}) =>
    attrs ?
        Object.keys(attrs)
            .filter(x => /^on[a-z]/.exec(x))
            .reduce((a, name) => {
                a[name] = attrs[name]
                delete attrs[name]
                return a
            }, POOL.get()) :
        POOL.get()

const applyEvents = (events, el, strip_existing=true) => {
    strip_existing && removeEvents(el)
    Object.keys(events).forEach(name => el[name] = events[name])
}

const flatten = (arr) => {
    return (!(arr instanceof Array) ? [arr] : arr).reduce((a,v) => { // TODO, maybe add [arr] here?
        v instanceof Array ? a.push(...flatten(v)) : a.push(v)
        return a
    }, [])
}

const removeEvents = el => {
    // strip away event handlers on el, if it exists
    if(!el) return;
    for(var i in el){
        if(/^on([a-z]+)/.exec(i)) {
            el[i] = null
        }
    }
}

const mounts = new Map()

export const mount = (fn, el) => {
    mounts.set(el, fn)
    render(fn, el)
}

const render = debounce((fn, el) =>
    simpleRenderingMode ? simpleApply(fn, el) : applyUpdates(fn, el.children[0], el), 16.6)

export const update = () => {
    for(let [el,fn] of mounts.entries())
        render(fn, el)
}

// recycle or create a new el
const createTag = (vdom=POOL.get(), el, parent=el&&el.parentElement) => {

    // make text nodes from primitive types
    if(!(vdom instanceof Object)){
        let t = document.createTextNode(vdom)
        if(el){
            parent.insertBefore(t,el)
            removeEl(el)
        } else {
            parent.appendChild(t)
        }
        return t
    }

    // else make an HTMLElement from "tag" types
    let {tag, attrs, id, className, unload} = vdom
    if(!el || !el.tagName || el.tagName.toLowerCase() !== tag.toLowerCase()){
        let t = document.createElement(tag)
        el ? (parent.insertBefore(t, el), removeEl(el)) : parent.appendChild(t)
        el = t
    }

    let events = stripEvents(vdom)
    rAF(() => applyEvents(events, el))
    attrs && Object.keys(attrs).forEach(attr =>
        (attr.indexOf('-')!==-1) ?
            el.setAttribute(attr, attrs[attr]) :
            (el[attr] = attrs[attr]))
    let _id = attrs.id || id
    if(_id) el.id = _id
    let _className = ((attrs.className || '') + ' ' + (className || '')).trim()
    if(_className) el.className = _className
    if(unload instanceof Function) {
        if(el.unload && (el.unload.indexOf(unload) === -1)) el.unload.push(unload)
        else if(!el.unload) el.unload = [unload]
    }

    return el
}

const simpleApply = (fn, el) => el.innerHTML = html(fn())

// find parent element, and remove the input element
const removeEl = el => {
    if(!el) return
    removeEvents(el)
    el.parentElement.removeChild(el)
    if(el.unload instanceof Array) el.map(x => x())
}

const applyUpdates = (vdom, el, parent=el&&el.parentElement) => {
    // if(!parent || vdom === undefined){
    //     console.log({message:'Rendering tree problem?', vdom, el, parent})
    //     throw 'errorrrrrrrrrrrrrrr'
    // }

    // if vdom is a function, execute it until it isn't
    while(vdom instanceof Function)
        vdom = vdom()

    // create/edit el under parent
    let _el = vdom instanceof Array ? parent : createTag(vdom, el, parent)

    let vdom_children = flatten(vdom instanceof Array ? vdom : vdom && vdom.children || []),
        el_children = vdom instanceof Array ? parent.childNodes : _el.childNodes || []

    vdom && vdom.attrs && vdom.attrs.config && rAF(() => vdom.attrs.config(_el))

    while(el_children.length > vdom_children.length){
        removeEl(el_children[el_children.length-1])
    }

    for(let i=0; i<vdom_children.length; i++){
        applyUpdates(vdom_children[i],el_children[i],_el)
    }

    // currently clears/zeroes out the data prematurely, need to figure this out
    // rAF(() => POOL.recycle(vdom))
}

export const qs = (s='body', el=document) => el.querySelector(s)

const resolver  = (states = {}) => {
    let promises = []

    const _await = (_promises = []) => {
        promises = promises.concat(_promises)
        return Promise.all(promises)
    }

    const finish = () => {
        const total = promises.length
        return Promise.all(promises).then(values => {
            if(promises.length > total){
                return finish()
            }
            return values
        })
    }

    const resolve = (props) => {
        const keys = Object.keys(props)
        if (!keys.length) {
            return Promise.resolve(true)
        }

        let f = []
        keys.forEach((name) => {
            let x = props[name],
                fn = x instanceof Function && x()

            if(fn && fn.then instanceof Function){
                f.push(fn.then(d => states[name] = d))
            }
        })

        return _await(f)
    }

    const getState = () => states

    return { finish, resolve, getState }
}

export const container = (view, queries = {}, instance=resolver()) => {
    instance.resolve(queries).then(() => update())
    return () => view(instance.getState())
}

/*
usage:

let component = () =>
    new Array(20).fill(true).map(x =>
        m('div', {onMouseOver: e => log(e.target.innerHTML)}, range(1,100)))

client-side
-----
mount(component, qs())

server-side (Express)
-----
res.send(html(component()))

client-side constant re-rendering
-----
const run = () => {
    setTimeout(run, 20)
    update()
}
run()
*/