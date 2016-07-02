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

let mnt

export const mount = (fn, el) => {
    mnt = [el, fn]
    render(fn, el)
}

const render = debounce((fn, el) => rAF(_ => {
    applyUpdates(fn, el.children[0], el)
}))

export const update = () => {
    if(!mnt) return
    let [el, fn] = mnt
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
            } else if(attr === 'innerHTML'){
                rAF(() => el.innerHTML = attrs[attr])
            } else if(attr === 'value'){
                rAF(() => el.value = attrs[attr])
            } else {
                el.setAttribute(attr, attrs[attr])
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
    if(typeof vdom !== 'object'){
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
        shouldExchange = !el || !el.tagName || (tag && el.tagName.toLowerCase() !== tag.toLowerCase()),
        _shouldUpdate = !(shouldUpdate instanceof Function) || shouldUpdate(el)

    if(!attrs) return
    if(!_shouldUpdate && el) return

    if(shouldExchange){
        let t = document.createElement(tag)
        el ? (parent.insertBefore(t, el), removeEl(el)) : parent.appendChild(t)
        el = t
    }

    setAttrs(vdom, el)
    if(el.unload instanceof Function) {
        rAF(el.unload)
    }
    if(unload instanceof Function) {
        el.unload = unload
    }
    applyEvents(stripEvents(vdom), el)
    config && rAF(_ => config(el))
    return el
}

// find parent element, and remove the input element
const removeEl = el => {
    if(!el) return
    el.parentElement.removeChild(el)
    removeEvents(el)
    // removed for now, added unload logic to the immediate draw()s
    if(el.unload instanceof Function)
        el.unload()
}

const insertAt = (el, parent, i) => {
    if(parent.children.length > i) {
        let next_sib = parent.children[i]
        parent.insertBefore(el, next_sib)
    } else {
        parent.appendChild(el)
    }
}

const applyUpdates = (vdom, el, parent=el&&el.parentElement) => {
    let v = vdom
    // if vdom is a function, execute it until it isn't
    while(vdom instanceof Function)
        vdom = vdom()

    if(!vdom) return

    if(vdom.resolve instanceof Function){
        let i = parent.children.length
        // console.log(1, {v, el, parent})
        return vdom.resolve().then(v => {
            // console.log(2, {v, el, parent})
            if(!el) {
                let x = createTag(v, null, parent)
                insertAt(x, parent, i)
                applyUpdates(v, x, parent)
            } else {
                applyUpdates(v, el, parent)
            }
        })
    }

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
}

export const qs = (s='body', el=document) => el.querySelector(s)


const resolver  = (states = {}) => {
    let promises = [],
        done = false

    const _await = (_promises = []) => {
        promises = [...promises, ..._promises]
        return finish()
    }

    const wait = (ms=0) => new Promise(res => setTimeout(res, ms))

    const isDone = () => done

    const finish = () => {
        const total = promises.length
        return wait().then(_ => Promise.all(promises)).then(values => {
            if(promises.length > total){
                return finish()
            }
            done = true
            return states
        })
    }

    const resolve = (props) => {
        const keys = Object.keys(props)
        if (!keys.length)
            return Promise.resolve(true)

        let f = []
        keys.forEach(name => {
            let x = props[name]

            while(x instanceof Function)
                x = x()

            if(x && x.then instanceof Function)
                f.push(x.then(d => states[name] = d))
        })

        return _await(f)
    }

    const getState = () => states

    return { finish, resolve, getState, promises, isDone }
}

const gs = (view, state) => {
    let r = view(state)
    while(r instanceof Function)
        r = view(instance.getState())
    return r
}

export const container = (view, queries={}, instance=resolver()) => {
    let wrapper_view = state =>
        instance.isDone() ? view(state) : m('span')

    return () => {
        let r = gs(wrapper_view, instance.getState())
        instance.resolve(queries)

        if(r instanceof Array) {
            let d = instance.finish().then(_ =>
                gs(wrapper_view, instance.getState()))

            return r.map((x,i) => {
                x.resolve = _ => d.then(vdom => vdom[i])
                return x
            })
        }

        r.resolve = _ => instance.finish().then(_ =>
            gs(wrapper_view, instance.getState()))

        return r
    }
}

const reservedAttrs = ['className','id']

const toHTML = _vdom => {
    while(_vdom instanceof Function) _vdom = _vdom()
    if(_vdom instanceof Array) return new Promise(r => r(html(..._vdom)))
    if(!_vdom) return new Promise(r => r(''))
    if(typeof _vdom !== 'object') return new Promise(r => r(_vdom))
    return (_vdom.resolve ? _vdom.resolve() : Promise.resolve()).then(vdom => {
        if(!vdom) vdom = _vdom

        if(vdom instanceof Array) return new Promise(r => r(html(...vdom)))

        const {tag, id, className, attrs, children, instance} = vdom,
            _id = (id || (attrs && attrs.id)) ? ` id="${(id || (attrs && attrs.id) || '')}"` : '',
            _class = (className || (attrs && attrs.className)) ? ` class="${((className||'') + ' ' + (attrs.className||'')).trim()}"` : ''

        const events = stripEvents(vdom)
        let _attrs = '',
            inner = ''
        for(var i in (attrs || Object.create(null))){
            if(i === 'style'){
                _attrs += ` style="${stylify(attrs[i])}"`
            } else if(i === 'innerHTML') {
                inner = attrs[i]
            } else if(reservedAttrs.indexOf(i) === -1){
                _attrs += ` ${i}="${attrs[i]}"`
            }
        }

        if(!inner && children)
            return html(...children).then(str =>
                `<${tag}${_id}${_class}${_attrs}>${str}</${tag}>`)

        if('br,input,img'.split(',').filter(x => x===tag).length === 0)
            return new Promise(r => r(`<${tag}${_id}${_class}${_attrs}>${inner}</${tag}>`))

        return new Promise(r => r(`<${tag}${_id}${_class}${_attrs} />`))
    })
}

export const html = (...v) =>
    Promise.all(v.map(toHTML)).then(x => x.filter(x => !!x).join(''))



/*
usage:

let component = () =>
    new Array(20).fill(true).map(x =>
        m('div', {onMouseOver: e => log(e.target.innerHTML)}, range(1,100)))

client-side
-----
mount(component, qs())

client-side constant re-rendering
-----
const run = () => {
    setTimeout(run, 20)
    update()
}
run()
*/

/* ----------------------------- CONTAINER / HTML USAGE (Server-side rendering)

const name = _ => new Promise(res => setTimeout(_ => res('matt'), 1500))

let x = container(data => [
        m('div.test.row', {className:'hola', 'data-name':data.name, style:{border:'1px solid black'}}),
        m('div', data.name),
    ],
    {name}
)

html(x).then(x => log(x)).catch(e => log(e+''))
--------------------------- */