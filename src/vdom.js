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
        vdom = Object.create(null)

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

export const debounce = (func, wait, immediate, timeout) =>
    (...args) => {
        let later = () => {
            timeout = null
            !immediate && func(...args)
        }
        var callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait || 0)
        callNow && func(...args)
    }

export const m = (selector, attrs=Object.create(null), ...children) => {
    if(attrs.tag || !(typeof attrs === 'object') || attrs instanceof Array || attrs instanceof Function){
        if(attrs instanceof Array) children.unshift(...attrs)
        else children.unshift(attrs)
        attrs = Object.create(null)
    }
    let vdom = parseSelector(selector)
    if(children.length)
        vdom.children = children
    vdom.attrs = attrs
    vdom.shouldUpdate = attrs.shouldUpdate
    vdom.unload = attrs.unload
    vdom.config = attrs.config
    delete attrs.unload
    delete attrs.shouldUpdate
    delete attrs.config
    return vdom
}

const reservedAttrs = ['className','id']
export const html = vdom => {
    if(vdom instanceof Array) return vdom.map(c => html(c)).join(' ')
    if(!(typeof vdom === 'object') || (Object.getPrototypeOf(vdom) !== Object.prototype)) return vdom

    const {tag, id, className, attrs, children} = vdom,
        _id = `id="${(id || attrs.id || '')}"`,
        _class = `class="${((className||'') + ' ' + (attrs.className||'')).trim()}"`
    const closing = children ? `${children.map(c => html(c)).join(' ')}</${tag}>` : ''
    // TODO: figure out wtf todo here?
    // maybe just never use these, only use html() on server rendering?
    const events = stripEvents(vdom)
    let _attrs = ''
    for(var i in (attrs || Object.create(null))){
        if(reservedAttrs.indexOf(x) === -1){
            _attrs += ` ${i}="${attrs[i]}"`
        }
    }

    // POOL.recycle(vdom)

    return `<${tag} ${_id} ${_class} ${_attrs} ${!children ? '/' : ''}>${closing}`
}

export const rAF =
      global.document &&
      (requestAnimationFrame ||
      webkitRequestAnimationFrame ||
      mozRequestAnimationFrame) ||
      (cb => setTimeout(cb, 16.6))

// creatign html, strip events from DOM element... for now just deleting
const stripEvents = ({attrs}) => {
    let a = Object.create(null)

    if(attrs){
        for(var name in attrs){
            if(name[0]==='o'&&name[1]==='n') {
                a[name] = attrs[name]
                delete attrs[name]
            }
        }
    }

    return a
}

const applyEvents = (events, el, strip_existing=true) => {
    strip_existing && removeEvents(el)
    for(var name in events){
        el[name] = events[name]
    }
}

const flatten = (arr, a=[]) => {
    for(var i=0,len=arr.length; i<len; i++){
        let v = arr[i]
        if(!(v instanceof Array)){
            a.push(v)
        } else {
            flatten(v, a)
        }
    }
    return a
}

const EVENTS = 'mouseover,mouseout,wheel,mousemove,blur,focus,click,abort,afterprint,animationend,animationiteration,animationstart,beforeprint,canplay,canplaythrough,change,contextmenu,dblclick,drag,dragend,dragenter,dragleave,dragover,dragstart,drop,durationchange,emptied,ended,error,load,input,invalid,keydown,keypress,keyup,loadeddata,loadedmetadata,mousedown,mouseenter,mouseleave,mouseup,pause,pointercancel,pointerdown,pointerenter,pointerleave,pointermove,pointerout,pointerover,pointerup,play,playing,ratechange,reset,resize,scroll,seeked,seeking,select,selectstart,selectionchange,show,submit,timeupdate,touchstart,touchend,touchcancel,touchmove,touchenter,touchleave,transitionend,volumechange,waiting'.split(',').map(x => 'on'+x)

const removeEvents = el => {
    // strip away event handlers on el, if it exists
    if(!el) return;
    for(var i in EVENTS){
        el[i] = null
    }
}

const mounts = new Map()

export const mount = (fn, el) => {
    mounts.set(el, fn)
    render(fn, el)
}

const render = debounce((fn, el) => {
    if(simpleRenderingMode) return simpleApply(fn, el)
    applyUpdates(fn, el.children[0], el)
}, 16.6)

export const update = () => {
    for(let [el,fn] of mounts.entries())
        render(fn, el)
}

const stylify = style => {
    let s = ''
    for(var i in style){
        s+=`${i}:${style[i]};`
    }
    return s
}

const setAttrs = ({attrs, id, className},el) => {
    if(attrs){
        for(var attr in attrs){
            if(attr === 'style') {
                el.style = stylify(attrs[attr])
            } else {
                el[attr] = attrs[attr]
            }
        }
    }

    let _id = attrs.id || id
    if(_id) el.id = _id
    let _className = ((attrs.className || '') + ' ' + (className || '')).trim()
    if(_className) el.className = _className
}

// recycle or create a new el
const createTag = (vdom=Object.create(null), el, parent=el&&el.parentElement) => {

    // make text nodes from primitive types
    if(!(typeof vdom === 'object')){
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
    let {tag, attrs, id, className, unload, shouldUpdate, config} = vdom,
        shouldExchange = !el || !el.tagName || el.tagName.toLowerCase() !== tag.toLowerCase(),
        _shouldUpdate = !(shouldUpdate instanceof Function) || shouldUpdate()

    if(!_shouldUpdate && el) return

    if(shouldExchange){
        let t = document.createElement(tag)
        el ? (parent.insertBefore(t, el), removeEl(el)) : parent.appendChild(t)
        el = t
    }

    setAttrs(vdom, el)
    if(unload instanceof Function) {
        if(el.unload && (el.unload.indexOf(unload) === -1)) el.unload.push(unload)
        else if(!el.unload) el.unload = [unload]
    }
    applyEvents(stripEvents(vdom), el)
    config && rAF(_ => config(el))
    return el
}

const simpleApply = (fn, el) => el.innerHTML = html(fn())

// find parent element, and remove the input element
const removeEl = el => {
    if(!el) return
    el.parentElement.removeChild(el)
    removeEvents(el)
    if(el.unload instanceof Array) {
        let u = el.unload
        for(var i in u) u[i]()
    }
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

    if(!_el) return

    if(vdom instanceof Array || vdom.children){
        let vdom_children = flatten(vdom instanceof Array ? vdom : vdom.children),
            el_children = vdom instanceof Array ? parent.childNodes : _el.childNodes

        while(el_children.length > vdom_children.length){
            removeEl(el_children[el_children.length-1])
        }

        for(let i=0; i<vdom_children.length; i++){
            applyUpdates(vdom_children[i],el_children[i],_el)
        }
    } else {
        while(_el.childNodes.length > 0){
            removeEl(_el.childNodes[_el.childNodes.length-1])
        }
    }

    // currently clears/zeroes out the data prematurely, need to figure this out
    // setTimeout(() => POOL.recycle(vdom), 500)
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