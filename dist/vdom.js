'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
        tagreg = tagName_regex().exec(s),
        tag = tagreg && tagreg.slice(1)[0],
        reg = class_id_regex(),
        vdom = POOL.get();

    if (tag) s = s.substr(tag.length);
    vdom.className = '';
    vdom.tag = tag || 'div';

    while ((test = reg.exec(s)) !== null) {
        test = test[0];
        if (test[0] === '.') vdom.className = (vdom.className + ' ' + test.substr(1)).trim();else if (test[0] === '#') vdom.id = test.substr(1);
    }
    return vdom;
};

var debounce = exports.debounce = function debounce(func, wait, immediate, timeout) {
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var later = function later() {
            timeout = null;
            !immediate && func.apply(undefined, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait || 200);
        callNow && func.apply(undefined, args);
    };
};

var m = exports.m = function m(selector) {
    for (var _len2 = arguments.length, children = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        children[_key2 - 2] = arguments[_key2];
    }

    var attrs = arguments.length <= 1 || arguments[1] === undefined ? POOL.get() : arguments[1];

    if (attrs.tag || !(attrs instanceof Object) || attrs instanceof Array || attrs instanceof Function) {
        if (attrs instanceof Array) children.unshift.apply(children, _toConsumableArray(attrs));else children.unshift(attrs);
        attrs = POOL.get();
    }
    var vdom = parseSelector(selector);
    if (children.length) vdom.children = children;
    vdom.attrs = attrs;
    vdom.shouldUpdate = attrs.shouldUpdate;
    vdom.unload = attrs.unload;
    vdom.config = attrs.config;
    delete attrs.unload;
    delete attrs.shouldUpdate;
    delete attrs.config;
    return vdom;
};

var reservedAttrs = ['className', 'id'];
var html = exports.html = function html(vdom) {
    if (vdom instanceof Array) return vdom.map(function (c) {
        return html(c);
    }).join(' ');
    if (!(vdom instanceof Object) || Object.getPrototypeOf(vdom) !== Object.prototype) return vdom;

    var tag = vdom.tag;
    var id = vdom.id;
    var className = vdom.className;
    var attrs = vdom.attrs;
    var children = vdom.children;
    var _id = 'id="' + (id || attrs.id || '') + '"';
    var _class = 'class="' + ((className || '') + ' ' + (attrs.className || '')).trim() + '"';
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

    return '<' + tag + ' ' + _id + ' ' + _class + ' ' + _attrs + ' ' + (!children ? '/' : '') + '>' + closing;
};

var rAF = exports.rAF = global.document && (requestAnimationFrame || webkitRequestAnimationFrame || mozRequestAnimationFrame) || function (cb) {
    return setTimeout(cb, 16.6);
};

// creatign html, strip events from DOM element... for now just deleting
var stripEvents = function stripEvents(_ref) {
    var attrs = _ref.attrs;
    return attrs ? Object.keys(attrs).filter(function (x) {
        return (/^on[a-z]/.exec(x)
        );
    }).reduce(function (a, name) {
        a[name] = attrs[name];
        delete attrs[name];
        return a;
    }, POOL.get()) : POOL.get();
};

var applyEvents = function applyEvents(events, el) {
    var strip_existing = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    strip_existing && removeEvents(el);
    Object.keys(events).forEach(function (name) {
        return el[name] = events[name];
    });
};

var flatten = function flatten(arr) {
    return (!(arr instanceof Array) ? [arr] : arr).reduce(function (a, v) {
        // TODO, maybe add [arr] here?
        v instanceof Array ? a.push.apply(a, _toConsumableArray(flatten(v))) : a.push(v);
        return a;
    }, []);
};

var removeEvents = function removeEvents(el) {
    // strip away event handlers on el, if it exists
    if (!el) return;
    for (var i in el) {
        if (/^on([a-z]+)/.exec(i)) {
            el[i] = null;
        }
    }
};

var mounts = new Map();

var mount = exports.mount = function mount(fn, el) {
    mounts.set(el, fn);
    render(fn, el);
};

var render = debounce(function (fn, el) {
    return simpleRenderingMode ? simpleApply(fn, el) : applyUpdates(fn, el.children[0], el);
}, 16.6);

var update = exports.update = function update() {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = mounts.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2);

            var el = _step$value[0];
            var fn = _step$value[1];

            render(fn, el);
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

var stylify = function stylify(style) {
    return Object.keys(style).map(function (x) {
        return x + ': ' + style[x] + ';';
    }).join('');
};

var setAttrs = function setAttrs(_ref2, el) {
    var attrs = _ref2.attrs;
    var id = _ref2.id;
    var className = _ref2.className;

    attrs && Object.keys(attrs).forEach(function (attr) {
        return attr === 'style' ? el.setAttribute(attr, stylify(attrs[attr])) : attr.indexOf('-') !== -1 ? el.setAttribute(attr, attrs[attr]) : el[attr] = attrs[attr];
    });

    var _id = attrs.id || id;
    if (_id) el.id = _id;
    var _className = ((attrs.className || '') + ' ' + (className || '')).trim();
    if (_className) el.className = _className;
};

// recycle or create a new el
var createTag = function createTag() {
    var vdom = arguments.length <= 0 || arguments[0] === undefined ? POOL.get() : arguments[0];
    var el = arguments[1];
    var parent = arguments.length <= 2 || arguments[2] === undefined ? el && el.parentElement : arguments[2];


    // make text nodes from primitive types
    if (!(vdom instanceof Object)) {
        var t = document.createTextNode(vdom);
        if (el) {
            parent.insertBefore(t, el);
            removeEl(el);
        } else {
            parent.appendChild(t);
        }
        return t;
    }

    // else make an HTMLElement from "tag" types
    var tag = vdom.tag;
    var attrs = vdom.attrs;
    var id = vdom.id;
    var className = vdom.className;
    var unload = vdom.unload;
    var shouldUpdate = vdom.shouldUpdate;
    var config = vdom.config;
    var shouldExchange = !el || !el.tagName || el.tagName.toLowerCase() !== tag.toLowerCase();
    var _shouldUpdate = !(shouldUpdate instanceof Function) || shouldUpdate();

    if (!_shouldUpdate && el) return;

    if (shouldExchange) {
        var _t = document.createElement(tag);
        el ? (parent.insertBefore(_t, el), removeEl(el)) : parent.appendChild(_t);
        el = _t;
    }

    setAttrs(vdom, el);
    if (unload instanceof Function) {
        if (el.unload && el.unload.indexOf(unload) === -1) el.unload.push(unload);else if (!el.unload) el.unload = [unload];
    }
    applyEvents(stripEvents(vdom), el);
    config && rAF(function (_) {
        return config(el);
    });
    return el;
};

var simpleApply = function simpleApply(fn, el) {
    return el.innerHTML = html(fn());
};

// find parent element, and remove the input element
var removeEl = function removeEl(el) {
    if (!el) return;
    removeEvents(el);
    el.parentElement.removeChild(el);
    if (el.unload instanceof Array) el.map(function (x) {
        return x();
    });
};

var applyUpdates = function applyUpdates(vdom, el) {
    var parent = arguments.length <= 2 || arguments[2] === undefined ? el && el.parentElement : arguments[2];

    // if(!parent || vdom === undefined){
    //     console.log({message:'Rendering tree problem?', vdom, el, parent})
    //     throw 'errorrrrrrrrrrrrrrr'
    // }

    // if vdom is a function, execute it until it isn't
    while (vdom instanceof Function) {
        vdom = vdom();
    } // create/edit el under parent
    var _el = vdom instanceof Array ? parent : createTag(vdom, el, parent);

    if (!_el) return;

    var vdom_children = flatten(vdom instanceof Array ? vdom : vdom && vdom.children || []),
        el_children = vdom instanceof Array ? parent.childNodes : _el.childNodes || [];

    while (el_children.length > vdom_children.length) {
        removeEl(el_children[el_children.length - 1]);
    }

    for (var i = 0; i < vdom_children.length; i++) {
        applyUpdates(vdom_children[i], el_children[i], _el);
    }

    // currently clears/zeroes out the data prematurely, need to figure this out
    // rAF(() => POOL.recycle(vdom))
};

var qs = exports.qs = function qs() {
    var s = arguments.length <= 0 || arguments[0] === undefined ? 'body' : arguments[0];
    var el = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];
    return el.querySelector(s);
};

var resolver = function resolver() {
    var states = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var promises = [];

    var _await = function _await() {
        var _promises = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        promises = promises.concat(_promises);
        return Promise.all(promises);
    };

    var finish = function finish() {
        var total = promises.length;
        return Promise.all(promises).then(function (values) {
            if (promises.length > total) {
                return finish();
            }
            return values;
        });
    };

    var resolve = function resolve(props) {
        var keys = Object.keys(props);
        if (!keys.length) {
            return Promise.resolve(true);
        }

        var f = [];
        keys.forEach(function (name) {
            var x = props[name],
                fn = x instanceof Function && x();

            if (fn && fn.then instanceof Function) {
                f.push(fn.then(function (d) {
                    return states[name] = d;
                }));
            }
        });

        return _await(f);
    };

    var getState = function getState() {
        return states;
    };

    return { finish: finish, resolve: resolve, getState: getState };
};

var container = exports.container = function container(view) {
    var queries = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var instance = arguments.length <= 2 || arguments[2] === undefined ? resolver() : arguments[2];

    instance.resolve(queries).then(function () {
        return update();
    });
    return function () {
        return view(instance.getState());
    };
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