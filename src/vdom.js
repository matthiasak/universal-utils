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

const
    class_id_regex = () => {
        return /[#\.][^#\.]+/ig
    },
    tagName_regex = () => {
        return /^([^\.#]+)\b/i
    }

const parseSelector = s => {
    let test = null,
        tag = tagName_regex().exec(s).slice(1)[0],
        reg = class_id_regex(),
        vdom = {tag: tag||'', classes:[], ids:[]}
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

export const m = (selector, attrs={}, ...children) => {
    if(attrs.hasOwnProperty('tag') || typeof attrs === "string"){
        children.unshift(attrs)
        attrs = {}
    }

    let vdom = parseSelector(selector)
    if(children.length)
        vdom.children = children
    vdom.attrs = attrs
    return vdom
}

export const html = vdom => {
    if(vdom instanceof Array) return vdom.map(c => html(c)).join(' ')
    if(!(vdom instanceof Object) || (Object.getPrototypeOf(vdom) !== Object.prototype)) return vdom

    const {tag, ids, classes, attrs, children} = vdom,
          id = ids.length ? `ids="${ids.join(' ')}"` : '',
          _class = classes.length ? `class="${classes.join(' ')}"` : ''

    const closing = children ? `${children.map(c => html(c)).join(' ')}</${tag}>` : ''

    return `<${tag} ${id} ${_class} ${!closing ? '/' : ''}>${closing}`
}

const rAF =
      requestAnimationFrame ||
      webkitRequestAnimationFrame ||
      mozRequestAnimationFrame ||
      ((cb) => setTimeout(cb, 0))

const mounts = new Map()

export const mount = (fn, el) => {
    render(fn, el)
    mounts.set(el, fn)
}

let _render
export const render = (fn, el) => {
    // let b = +new Date
    _render = html(fn())
    rAF(() => {
        el.innerHTML = _render
    })
    // log((+new Date - b)+'ms')
}

export const update = () => {
    for(let [el,fn] of mounts.entries()){
        render(fn, el)
    }
}

export const qs = (s='body', el=document) => el.querySelector(s)
