'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
        vdom = Object.create(null);

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
        timeout = setTimeout(later, wait || 0);
        callNow && func.apply(undefined, args);
    };
};

var m = exports.m = function m(selector) {
    for (var _len2 = arguments.length, children = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        children[_key2 - 2] = arguments[_key2];
    }

    var attrs = arguments.length <= 1 || arguments[1] === undefined ? Object.create(null) : arguments[1];

    if (attrs.tag || !((typeof attrs === 'undefined' ? 'undefined' : _typeof(attrs)) === 'object') || attrs instanceof Array || attrs instanceof Function) {
        if (attrs instanceof Array) children.unshift.apply(children, _toConsumableArray(attrs));else children.unshift(attrs);
        attrs = Object.create(null);
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

var rAF = exports.rAF = global.document && (requestAnimationFrame || webkitRequestAnimationFrame || mozRequestAnimationFrame) || function (cb) {
    return setTimeout(cb, 16.6);
};

// creatign html, strip events from DOM element... for now just deleting
var stripEvents = function stripEvents(_ref) {
    var attrs = _ref.attrs;

    var a = Object.create(null);

    if (attrs) {
        for (var name in attrs) {
            if (name[0] === 'o' && name[1] === 'n') {
                a[name] = attrs[name];
                delete attrs[name];
            }
        }
    }

    return a;
};

var applyEvents = function applyEvents(events, el) {
    var strip_existing = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    strip_existing && removeEvents(el);
    for (var name in events) {
        el[name] = events[name];
    }
};

var flatten = function flatten(arr) {
    var a = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    for (var i = 0, len = arr.length; i < len; i++) {
        var v = arr[i];
        if (!(v instanceof Array)) {
            a.push(v);
        } else {
            flatten(v, a);
        }
    }
    return a;
};

var EVENTS = 'mouseover,mouseout,wheel,mousemove,blur,focus,click,abort,afterprint,animationend,animationiteration,animationstart,beforeprint,canplay,canplaythrough,change,contextmenu,dblclick,drag,dragend,dragenter,dragleave,dragover,dragstart,drop,durationchange,emptied,ended,error,load,input,invalid,keydown,keypress,keyup,loadeddata,loadedmetadata,mousedown,mouseenter,mouseleave,mouseup,pause,pointercancel,pointerdown,pointerenter,pointerleave,pointermove,pointerout,pointerover,pointerup,play,playing,ratechange,reset,resize,scroll,seeked,seeking,select,selectstart,selectionchange,show,submit,timeupdate,touchstart,touchend,touchcancel,touchmove,touchenter,touchleave,transitionend,volumechange,waiting'.split(',').map(function (x) {
    return 'on' + x;
});

var removeEvents = function removeEvents(el) {
    // strip away event handlers on el, if it exists
    if (!el) return;
    for (var i in EVENTS) {
        el[i] = null;
    }
};

var mnt = void 0;

var mount = exports.mount = function mount(fn, el) {
    mnt = [el, fn];
    render(fn, el);
};

var render = debounce(function (fn, el) {
    return rAF(function (_) {
        applyUpdates(fn, el.children[0], el);
    });
});

var update = exports.update = function update() {
    if (!mnt) return;
    var _mnt = mnt;

    var _mnt2 = _slicedToArray(_mnt, 2);

    var el = _mnt2[0];
    var fn = _mnt2[1];

    render(fn, el);
};

var stylify = function stylify(style) {
    var s = '';
    for (var i in style) {
        s += i + ':' + style[i] + ';';
    }
    return s;
};

var setAttrs = function setAttrs(_ref2, el) {
    var attrs = _ref2.attrs;
    var id = _ref2.id;
    var className = _ref2.className;

    if (attrs) {
        for (var attr in attrs) {
            if (attr === 'style') {
                el.style = stylify(attrs[attr]);
            } else if (attr === 'innerHTML') {
                rAF(function () {
                    return el.innerHTML = attrs[attr];
                });
            } else if (attr === 'value') {
                rAF(function () {
                    return el.value = attrs[attr];
                });
            } else {
                el.setAttribute(attr, attrs[attr]);
            }
        }
    }

    var _id = attrs.id || id;
    if (_id) el.id = _id;
    var _className = ((attrs.className || '') + ' ' + (className || '')).trim();
    if (_className) el.className = _className;
};

// recycle or create a new el
var createTag = function createTag() {
    var vdom = arguments.length <= 0 || arguments[0] === undefined ? Object.create(null) : arguments[0];
    var el = arguments[1];
    var parent = arguments.length <= 2 || arguments[2] === undefined ? el && el.parentElement : arguments[2];


    // make text nodes from primitive types
    if ((typeof vdom === 'undefined' ? 'undefined' : _typeof(vdom)) !== 'object') {
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
    var shouldExchange = !el || !el.tagName || tag && el.tagName.toLowerCase() !== tag.toLowerCase();
    var _shouldUpdate = !(shouldUpdate instanceof Function) || shouldUpdate(el);

    if (!attrs) return;
    if (!_shouldUpdate && el) return;

    if (shouldExchange) {
        var _t = document.createElement(tag);
        el ? (parent.insertBefore(_t, el), removeEl(el)) : parent.appendChild(_t);
        el = _t;
    }

    setAttrs(vdom, el);
    if (el.unload instanceof Function) {
        rAF(el.unload);
    }
    if (unload instanceof Function) {
        el.unload = unload;
    }
    applyEvents(stripEvents(vdom), el);
    config && rAF(function (_) {
        return config(el);
    });
    return el;
};

// find parent element, and remove the input element
var removeEl = function removeEl(el) {
    if (!el) return;
    el.parentElement.removeChild(el);
    removeEvents(el);
    // removed for now, added unload logic to the immediate draw()s
    if (el.unload instanceof Function) el.unload();
};

var insertAt = function insertAt(el, parent, i) {
    if (parent.children.length > i) {
        var next_sib = parent.children[i];
        parent.insertBefore(el, next_sib);
    } else {
        parent.appendChild(el);
    }
};

var applyUpdates = function applyUpdates(vdom, el) {
    var parent = arguments.length <= 2 || arguments[2] === undefined ? el && el.parentElement : arguments[2];

    var v = vdom;
    // if vdom is a function, execute it until it isn't
    while (vdom instanceof Function) {
        vdom = vdom();
    }if (!vdom) return;

    if (vdom.resolve instanceof Function) {
        var _ret = function () {
            var i = parent.children.length;
            // console.log(1, {v, el, parent})
            return {
                v: vdom.resolve().then(function (v) {
                    // console.log(2, {v, el, parent})
                    if (!el) {
                        var x = createTag(v, null, parent);
                        insertAt(x, parent, i);
                        applyUpdates(v, x, parent);
                    } else {
                        applyUpdates(v, el, parent);
                    }
                })
            };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }

    // create/edit el under parent
    var _el = vdom instanceof Array ? parent : createTag(vdom, el, parent);

    if (!_el) return;

    if (vdom instanceof Array || vdom.children) {
        var vdom_children = flatten(vdom instanceof Array ? vdom : vdom.children),
            el_children = vdom instanceof Array ? parent.childNodes : _el.childNodes;

        while (el_children.length > vdom_children.length) {
            removeEl(el_children[el_children.length - 1]);
        }

        for (var _i = 0; _i < vdom_children.length; _i++) {
            applyUpdates(vdom_children[_i], el_children[_i], _el);
        }
    } else {
        while (_el.childNodes.length > 0) {
            removeEl(_el.childNodes[_el.childNodes.length - 1]);
        }
    }
};

var qs = exports.qs = function qs() {
    var s = arguments.length <= 0 || arguments[0] === undefined ? 'body' : arguments[0];
    var el = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];
    return el.querySelector(s);
};

var resolver = function resolver() {
    var states = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var promises = [],
        done = false;

    var _await = function _await() {
        var _promises = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        promises = [].concat(_toConsumableArray(promises), _toConsumableArray(_promises));
        return finish();
    };

    var wait = function wait() {
        var ms = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        return new Promise(function (res) {
            return setTimeout(res, ms);
        });
    };

    var isDone = function isDone() {
        return done;
    };

    var finish = function finish() {
        var total = promises.length;
        return wait().then(function (_) {
            return Promise.all(promises);
        }).then(function (values) {
            if (promises.length > total) {
                return finish();
            }
            done = true;
            return states;
        });
    };

    var resolve = function resolve(props) {
        var keys = Object.keys(props);
        if (!keys.length) return Promise.resolve(true);

        var f = [];
        keys.forEach(function (name) {
            var x = props[name];

            while (x instanceof Function) {
                x = x();
            }if (x && x.then instanceof Function) f.push(x.then(function (d) {
                return states[name] = d;
            }));
        });

        return _await(f);
    };

    var getState = function getState() {
        return states;
    };

    return { finish: finish, resolve: resolve, getState: getState, promises: promises, isDone: isDone };
};

var gs = function gs(view, state) {
    var r = view(state);
    while (r instanceof Function) {
        r = view(instance.getState());
    }return r;
};

var container = exports.container = function container(view) {
    var queries = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var instance = arguments.length <= 2 || arguments[2] === undefined ? resolver() : arguments[2];

    var wrapper_view = function wrapper_view(state) {
        return instance.isDone() ? view(state) : m('span');
    };

    return function () {
        var r = gs(wrapper_view, instance.getState());
        instance.resolve(queries);

        if (r instanceof Array) {
            var _ret2 = function () {
                var d = instance.finish().then(function (_) {
                    return gs(wrapper_view, instance.getState());
                });

                return {
                    v: r.map(function (x, i) {
                        x.resolve = function (_) {
                            return d.then(function (vdom) {
                                return vdom[i];
                            });
                        };
                        return x;
                    })
                };
            }();

            if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
        }

        r.resolve = function (_) {
            return instance.finish().then(function (_) {
                return gs(wrapper_view, instance.getState());
            });
        };

        return r;
    };
};

var reservedAttrs = ['className', 'id'];

var toHTML = function toHTML(_vdom) {
    while (_vdom instanceof Function) {
        _vdom = _vdom();
    }if (_vdom instanceof Array) return new Promise(function (r) {
        return r(html.apply(undefined, _toConsumableArray(_vdom)));
    });
    if (!_vdom) return new Promise(function (r) {
        return r('');
    });
    if ((typeof _vdom === 'undefined' ? 'undefined' : _typeof(_vdom)) !== 'object') return new Promise(function (r) {
        return r(_vdom);
    });
    return (_vdom.resolve ? _vdom.resolve() : Promise.resolve()).then(function (vdom) {
        if (!vdom) vdom = _vdom;

        if (vdom instanceof Array) return new Promise(function (r) {
            return r(html.apply(undefined, _toConsumableArray(vdom)));
        });

        var _vdom2 = vdom;
        var tag = _vdom2.tag;
        var id = _vdom2.id;
        var className = _vdom2.className;
        var attrs = _vdom2.attrs;
        var children = _vdom2.children;
        var instance = _vdom2.instance;
        var _id = id || attrs && attrs.id ? ' id="' + (id || attrs && attrs.id || '') + '"' : '';
        var _class = className || attrs && attrs.className ? ' class="' + ((className || '') + ' ' + (attrs.className || '')).trim() + '"' : '';

        var events = stripEvents(vdom);
        var _attrs = '',
            inner = '';
        for (var i in attrs || Object.create(null)) {
            if (i === 'style') {
                _attrs += ' style="' + stylify(attrs[i]) + '"';
            } else if (i === 'innerHTML') {
                inner = attrs[i];
            } else if (reservedAttrs.indexOf(i) === -1) {
                _attrs += ' ' + i + '="' + attrs[i] + '"';
            }
        }

        if (!inner && children) return html.apply(undefined, _toConsumableArray(children)).then(function (str) {
            return '<' + tag + _id + _class + _attrs + '>' + str + '</' + tag + '>';
        });

        if ('br,input,img'.split(',').filter(function (x) {
            return x === tag;
        }).length === 0) return new Promise(function (r) {
            return r('<' + tag + _id + _class + _attrs + '>' + inner + '</' + tag + '>');
        });

        return new Promise(function (r) {
            return r('<' + tag + _id + _class + _attrs + ' />');
        });
    });
};

var html = exports.html = function html() {
    for (var _len3 = arguments.length, v = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        v[_key3] = arguments[_key3];
    }

    return Promise.all(v.map(toHTML)).then(function (x) {
        return x.filter(function (x) {
            return !!x;
        }).join('');
    });
};

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