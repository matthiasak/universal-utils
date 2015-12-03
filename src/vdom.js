/*
    todo:
    - diff algo
    - apply patch algo
*/

/*
VDOM structure:
{
    tag: '...',
    attrs: {},
    classes: [], (optional)
    ids: [], (optional)
    children: [], (optional)
    didMount: ...,
    willMount: ...
    didUnmount: ...,
    willUnmount: ...,
    shouldComponentUpdate: ...,
}
 */

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
        tag = tagName_regex().exec(s).slice(1)[0],
        reg = class_id_regex(),
        vdom = POOL.get()

    vdom.tag = tag || ''
    vdom.classes = []
    vdom.ids = []

    if(tag) s = s.substr(tag.length)
    while((test = reg.exec(s)) !== null){
        test = test[0]
        if(test[0] === '.')
            vdom.classes.push(test.substr(1))
        else if(test[0] === '#')
            vdom.ids.push(test.substr(1))
    }
    return vdom
}

export const m = (selector, attrs=POOL.get(), ...children) => {
    if(attrs.tag || !(attrs instanceof Object) || attrs instanceof Array){
        if(attrs instanceof Array) children.unshift(...attrs)
        else children.unshift(attrs)
        attrs = POOL.get()
    }
    let vdom = parseSelector(selector)
    if(children.length)
        vdom.children = children
    vdom.attrs = attrs
    return vdom
}

const reservedAttrs = ['className','id']

// creatign html, strip events from DOM element... for now just deleting
const stripEvents = ({attrs}) =>
    attrs ?
        Object.keys(attrs)
            .filter(x => /^on[a-zA-Z]/.exec(x))
            .reduce((a, name) => {
                a[name] = attrs[name]
                delete attrs[name]
                return a
            }, POOL.get()) :
        POOL.get()

const applyEvents = (events, el) => {
    Object.keys(el)
        .filter(x => /^on[a-zA-Z]/.exec(x))
        .forEach(x => delete el[x])

    Object.keys(events).forEach(name =>
        el.addEventListener(name.substr(2).toLowerCase(), events[name]))
}

export const html = vdom => {
    if(vdom instanceof Array) return vdom.map(c => html(c)).join(' ')
    if(!(vdom instanceof Object) || (Object.getPrototypeOf(vdom) !== Object.prototype)) return vdom

    const {tag, ids, classes, attrs, children} = vdom,
        id = `id="${(ids || []).concat(attrs ? attrs.id : '').join(' ')}"`,
        _class = `class="${(classes || []).concat(attrs ? attrs.className : '').join(' ')}"`
    const closing = children ? `${children.map(c => html(c)).join(' ')}</${tag}>` : ''
    // TODO: figure out wtf todo here?
    // maybe just never use these, only use html() on server rendering?
    const events = stripEvents(vdom)
    const _attrs = Object.keys(attrs || POOL.get())
        .filter(x => reservedAttrs.indexOf(x) === -1)
        .reduce((a,v,i,arr) => `${a} ${v}="${attrs[v]}"`,'')

    POOL.recycle(vdom)

    return `<${tag} ${id} ${_class} ${_attrs} ${!children ? '/' : ''}>${closing}`
}

const rAF =
      requestAnimationFrame ||
      webkitRequestAnimationFrame ||
      mozRequestAnimationFrame ||
      ((cb) => setTimeout(cb, 16.6))

const mounts = new Map()

export const mount = (fn, el) => {
    render(fn(), el)
    mounts.set(el, fn)
}

const debounce = (func, wait) => {
    let timeout = null,
        calls = 0,
        memo = (func, ...args) => {
            timeout = null
            func(...args)
        }
    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(memo.bind(null, func, ...args), wait)
    }
}

const render = debounce((vdom, el) => {
    rAF(() => simpleRenderingMode ? simpleApply(vdom, el) : applyUpdates(vdom, el))
}, 16)

export const update = () => {
    for(let [el,fn] of mounts.entries()){
        render(fn(), el)
    }
}

const createTag = (vdom=POOL.get()) => {
    if(!(vdom instanceof Object))
        return document.createTextNode(vdom)
    let {tag, attrs, ids, classes} = vdom,
        x = document.createElement(tag),
        events = stripEvents(vdom)

    applyEvents(events, x)
    attrs && Object.keys(attrs).forEach(attr => x.setAttribute(attr, attrs[attr]))
    x.id = ids ? ids.join(' ') : ''
    x.className = classes ? classes.join(' ') : ''
    return x
}

const simpleApply = (vdom, el) =>
    el.innerHTML = html(vdom)

const applyUpdates = (vdom,el) => {
    if(!vdom) {
        el && el.parentElement && el.parentElement.removeChild(el)
        return
    }

    let __el = el && el.children,
        __v = vdom && vdom.children

    if(vdom instanceof Array){
        __v = vdom
    } else if(vdom instanceof Object && vdom.tag){
        if(!el || el.tagName !== vdom.tag) {
            let t = createTag(vdom)
            // t.innerHTML = html(vdom.children)
            el.parentElement.insertBefore(t, el)
            el.parentElement.removeChild(el)
            return applyUpdates(__v, t)
        }
    } else {
        let t = document.createTextNode(vdom)
        el.parentElement.insertBefore(t, el)
        el.parentElement.removeChild(el)
        return
    }

    const len = Math.max(__el.length, __v.length)
    for(let i=0; i<len; i++){
        let v = __v[i],
            d = __el[i]

        if(v && d){
            applyUpdates(v, d)
        } else if(v && !d){
            let t = createTag(v)
            applyUpdates(v.children, t)
            el.appendChild(t)
        } else if (!vdom && d) {
            d.parentElement.removeChild(d)
        }
    }

    // currently clears/zeroes out the data prematurely, need to figure this out
    // rAF(() => POOL.recycle(vdom))
}

export const qs = (s='body', el=document) => el.querySelector(s)

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