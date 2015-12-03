'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

var pool = function pool() {
    var pool = [];

    var get = function get() {
        return pool.length ? pool.shift() : {};
    };

    var recycle = function recycle(obj) {
        Object.keys(obj).forEach(function (k) {
            return delete obj[k];
        });
        pool.push(obj);
    };

    return { get: get, recycle: recycle };
};

var POOL = pool();

var simpleRenderingMode = false;

var class_id_regex = function class_id_regex() {
    return (/[#\.][^#\.]+/ig
    );
},
    tagName_regex = function tagName_regex() {
    return (/^([^\.#]+)\b/i
    );
};

var parseSelector = function parseSelector(s) {
    var test = null,
        tag = tagName_regex().exec(s).slice(1)[0],
        reg = class_id_regex(),
        vdom = POOL.get();

    vdom.tag = tag || '';
    vdom.classes = [];
    vdom.ids = [];

    if (tag) s = s.substr(tag.length);
    while ((test = reg.exec(s)) !== null) {
        test = test[0];
        if (test[0] === '.') vdom.classes.push(test.substr(1));else if (test[0] === '#') vdom.ids.push(test.substr(1));
    }
    return vdom;
};

var m = exports.m = function m(selector) {
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
    }

    var attrs = arguments.length <= 1 || arguments[1] === undefined ? POOL.get() : arguments[1];

    if (attrs.tag || !(attrs instanceof Object) || attrs instanceof Array) {
        if (attrs instanceof Array) children.unshift.apply(children, _toConsumableArray(attrs));else children.unshift(attrs);
        attrs = POOL.get();
    }
    var vdom = parseSelector(selector);
    if (children.length) vdom.children = children;
    vdom.attrs = attrs;
    return vdom;
};

var reservedAttrs = ['className', 'id'];

// creatign html, strip events from DOM element... for now just deleting
var stripEvents = function stripEvents(_ref) {
    var attrs = _ref.attrs;
    return attrs ? Object.keys(attrs).filter(function (x) {
        return (/^on[a-zA-Z]/.exec(x)
        );
    }).reduce(function (a, name) {
        a[name] = attrs[name];
        delete attrs[name];
        return a;
    }, POOL.get()) : POOL.get();
};

var applyEvents = function applyEvents(events, el) {
    Object.keys(el).filter(function (x) {
        return (/^on[a-zA-Z]/.exec(x)
        );
    }).forEach(function (x) {
        return delete el[x];
    });

    Object.keys(events).forEach(function (name) {
        return el.addEventListener(name.substr(2).toLowerCase(), events[name]);
    });
};

var html = exports.html = function html(vdom) {
    if (vdom instanceof Array) return vdom.map(function (c) {
        return html(c);
    }).join(' ');
    if (!(vdom instanceof Object) || Object.getPrototypeOf(vdom) !== Object.prototype) return vdom;

    var tag = vdom.tag;
    var ids = vdom.ids;
    var classes = vdom.classes;
    var attrs = vdom.attrs;
    var children = vdom.children;
    var id = 'id="' + (ids || []).concat(attrs ? attrs.id : '').join(' ') + '"';
    var _class = 'class="' + (classes || []).concat(attrs ? attrs.className : '').join(' ') + '"';
    var closing = children ? children.map(function (c) {
        return html(c);
    }).join(' ') + '</' + tag + '>' : '';
    // TODO: figure out wtf todo here?
    // maybe just never use these, only use html() on server rendering?
    var events = stripEvents(vdom);
    var _attrs = Object.keys(attrs || POOL.get()).filter(function (x) {
        return reservedAttrs.indexOf(x) === -1;
    }).reduce(function (a, v, i, arr) {
        return a + ' ' + v + '="' + attrs[v] + '"';
    }, '');

    POOL.recycle(vdom);

    return '<' + tag + ' ' + id + ' ' + _class + ' ' + _attrs + ' ' + (!children ? '/' : '') + '>' + closing;
};

var rAF = requestAnimationFrame || webkitRequestAnimationFrame || mozRequestAnimationFrame || function (cb) {
    return setTimeout(cb, 16.6);
};

var mounts = new Map();

var mount = exports.mount = function mount(fn, el) {
    render(fn(), el);
    mounts.set(el, fn);
};

var debounce = function debounce(func, wait) {
    var timeout = null,
        calls = 0,
        memo = function memo(func) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
        }

        timeout = null;
        func.apply(undefined, args);
    };
    return function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        clearTimeout(timeout);
        timeout = setTimeout(memo.bind.apply(memo, [null, func].concat(args)), wait);
    };
};

var render = debounce(function (vdom, el) {
    rAF(function () {
        return simpleRenderingMode ? simpleApply(vdom, el) : applyUpdates(vdom, el);
    });
}, 16);

var update = exports.update = function update() {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = mounts.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2);

            var el = _step$value[0];
            var fn = _step$value[1];

            render(fn(), el);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
};

var createTag = function createTag() {
    var vdom = arguments.length <= 0 || arguments[0] === undefined ? POOL.get() : arguments[0];

    if (!(vdom instanceof Object)) return document.createTextNode(vdom);
    var tag = vdom.tag;
    var attrs = vdom.attrs;
    var ids = vdom.ids;
    var classes = vdom.classes;
    var x = document.createElement(tag);
    var events = stripEvents(vdom);

    applyEvents(events, x);
    attrs && Object.keys(attrs).forEach(function (attr) {
        return x.setAttribute(attr, attrs[attr]);
    });
    x.id = ids ? ids.join(' ') : '';
    x.className = classes ? classes.join(' ') : '';
    return x;
};

var simpleApply = function simpleApply(vdom, el) {
    return el.innerHTML = html(vdom);
};

var applyUpdates = function applyUpdates(vdom, el) {
    if (!vdom) {
        el && el.parentElement && el.parentElement.removeChild(el);
        return;
    }

    var __el = el && el.children,
        __v = vdom && vdom.children;

    if (vdom instanceof Array) {
        __v = vdom;
    } else if (vdom instanceof Object && vdom.tag) {
        if (!el || el.tagName !== vdom.tag) {
            var t = createTag(vdom);
            // t.innerHTML = html(vdom.children)
            el.parentElement.insertBefore(t, el);
            el.parentElement.removeChild(el);
            return applyUpdates(__v, t);
        }
    } else {
        var t = document.createTextNode(vdom);
        el.parentElement.insertBefore(t, el);
        el.parentElement.removeChild(el);
        return;
    }

    var len = Math.max(__el.length, __v.length);
    for (var i = 0; i < len; i++) {
        var v = __v[i],
            d = __el[i];

        if (v && d) {
            applyUpdates(v, d);
        } else if (v && !d) {
            var t = createTag(v);
            applyUpdates(v.children, t);
            el.appendChild(t);
        } else if (!vdom && d) {
            d.parentElement.removeChild(d);
        }
    }

    // currently clears/zeroes out the data prematurely, need to figure this out
    // rAF(() => POOL.recycle(vdom))
};

var qs = exports.qs = function qs() {
    var s = arguments.length <= 0 || arguments[0] === undefined ? 'body' : arguments[0];
    var el = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];
    return el.querySelector(s);
};

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