'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
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
        vdom = { tag: tag || '', classes: [], ids: [] };
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

    var attrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (attrs.hasOwnProperty('tag') || typeof attrs === "string") {
        children.unshift(attrs);
        attrs = {};
    }

    var vdom = parseSelector(selector);
    if (children.length) vdom.children = children;
    vdom.attrs = attrs;
    return vdom;
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
    var id = ids.length ? 'ids="' + ids.join(' ') + '"' : '';
    var _class = classes.length ? 'class="' + classes.join(' ') + '"' : '';

    var closing = children ? children.map(function (c) {
        return html(c);
    }).join(' ') + '</' + tag + '>' : '';

    return '<' + tag + ' ' + id + ' ' + _class + ' ' + (!closing ? '/' : '') + '>' + closing;
};

var rAF = requestAnimationFrame || webkitRequestAnimationFrame || mozRequestAnimationFrame || function (cb) {
    return setTimeout(cb, 0);
};

var mounts = new Map();

var mount = exports.mount = function mount(fn, el) {
    render(fn, el);
    mounts.set(el, fn);
};

var _render = undefined;
var render = exports.render = function render(fn, el) {
    // let b = +new Date
    _render = html(fn());
    rAF(function () {
        el.innerHTML = _render;
    });
    // log((+new Date - b)+'ms')
};

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

var qs = exports.qs = function qs() {
    var s = arguments.length <= 0 || arguments[0] === undefined ? 'body' : arguments[0];
    var el = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];
    return el.querySelector(s);
};