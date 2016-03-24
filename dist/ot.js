'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.apply = exports.retain = exports.remove = exports.insert = exports.comp = exports.transform = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // inspired by http://operational-transformation.github.io/index.html

var _fp = require('./fp');

// clones each opchain and sums up retain() indexes
var computeIndices = function computeIndices() {
    for (var _len = arguments.length, ops = Array(_len), _key = 0; _key < _len; _key++) {
        ops[_key] = arguments[_key];
    }

    return ops.map(function (op) {
        return op.reduce(function (a, v) {
            if (v.retain) {
                v.index = a.reduce(function (count, i) {
                    return count + (i.retain || 0);
                }, 0) + v.retain;
            }
            return a.concat((0, _fp.clone)(v));
        }, []);
    });
};

var transform = exports.transform = function transform(_a, _b) {
    // tally retains

    var _computeIndices = computeIndices(_a, _b);

    var _computeIndices2 = _slicedToArray(_computeIndices, 2);

    var at = _computeIndices2[0];
    var bt = _computeIndices2[1];
    var res = [];
    var lastA = null;
    var lastB = null;

    // walk through each opchain and combine them
    while (at.length || bt.length) {
        var a = at[0],
            b = bt[0],
            aRetain = a && a.retain !== undefined,
            bRetain = b && b.retain !== undefined;

        if (a && !aRetain) {
            // run until you hit a retain or end
            while (a && !aRetain) {
                res.push(a);
                at.shift();
                a = at[0];
                aRetain = a && a.retain !== undefined;
            }
            continue;
        } else if (b && !bRetain) {
            // run until you hit a retain or end
            while (b && !bRetain) {
                res.push(b);
                bt.shift();
                b = bt[0];
                bRetain = b && b.retain !== undefined;
            }
            continue;
        }

        // now a and b are either retain ops or undefined

        if (a && b) {
            var lower = a.index <= b.index ? a : b,
                diff = Math.abs(a.index - b.index);
            if (lower === a) {
                b.retain = diff;
                res.push(a);
                at.shift();
            } else {
                a.retain = diff;
                res.push(b);
                bt.shift();
            }
            lastA = a;
            lastB = b;
        } else if (!a && b) {
            res.push(b);
            bt.shift();
            lastB = b;
        } else if (a && !b) {
            res.push(a);
            at.shift();
            lastA = a;
        }
    }

    return res;
};
// ops.reduce((a,v) => a.concat(...v), [])

var comp = exports.comp = function comp() {
    for (var _len2 = arguments.length, ops = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        ops[_key2] = arguments[_key2];
    }

    return ops.reduce(function (a, v) {
        return a.concat(v);
    }, []);
};

var insert = exports.insert = function insert(text) {
    return { insert: text };
};

var remove = exports.remove = function remove(text) {
    return { remove: text };
};

var retain = exports.retain = function retain(num) {
    return { retain: num };
};

var apply = exports.apply = function apply(str, ops) {
    var _i = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    var r = ops.reduce(function (_ref, v) {
        var a = _ref.a;
        var i = _ref.i;

        // log({a,i}, v)

        // at position i, insert v into a
        if (v.insert !== undefined) {
            return {
                a: a.slice(0, i) + v.insert + a.slice(i),
                i: i + v.insert.length
            };
        }

        // at position i, remove string v
        if (v.remove !== undefined) {
            var n = a.slice(i).slice(0, v.remove.length);
            if (n !== v.remove) throw 'remove error: ' + n + ' not at index i';
            return {
                a: a.slice(0, i) + a.slice(i + v.remove.length),
                i: Math.max(0, i - v.remove.length)
            };
        }

        // at position i, retain v chars
        if (v.retain !== undefined) {
            if (i + v.retain > a.length) throw 'retain error: not enough characters in string to retain';
            return { a: a, i: i + v.retain };
        }

        throw 'unrecognizable op: ' + JSON.stringify(v);
    }, { a: str, i: _i });

    // uncomment to ensure opchains must represent
    // all content within the result
    // if(r.i !== r.a.length)
    // throw `incomplete operations, expected length ${r.a.length}, but instead is ${r.i}`

    return r.a;
};

/**

HOW TO USE THIS MICROLIB:
----------------

import {transform, comp, insert, remove, retain, apply}

1. setup some operations, i.e. p1 adds '-you-' to a string at spot 2, and p2 adds '-i-' to a string at spot 0

let p1 = comp(
        retain(2),
        insert('-you-')
    ),
    p2 = comp(
        insert('-i-'),
        retain(2),
        insert('-us-')
    )

2. observe what a transform operation is: simple arrays of a small object representing how to edit something (replays actions in chronological order)

log(p1)
log(p2)

3. observe how to merge two parallel operations into one single operation chain

log(transform(p1,p2))

4. apply an "opchain" to a string

log(apply('me', p1))
log(apply('me', transform(p1,p2)))

5. test out interactions within arbiter (https://goo.gl/2iNxDy)

const css = `
form {
    padding: 1rem;
}

textarea {
    display: block;
    width: 100%;
    outline: 1px solid #222;
    background: #111;
    color: #aaa;
    font-family: monospace;
    font-weight: 100;
    padding: .5rem;
}
`

const app = () => {
    let u = universalUtils,
        {m, mount, update, qs, comp, apply, transform, insert, remove, retain} = u,
        stream = ''

    const edit = (val='') =>
        (e) => {
            let start = e.srcElement.selectionStart,
                end = e.srcElement.selectionEnd,
                {which} = e,
                v = e.srcElement.value,
                difflen = v.length - val.length

            // log([stream, val, v])

            if(difflen === 0) {
                log('length same, but content may have changed - TODO')
            } else if(difflen < 0){
                log('content deleted', [start,end], difflen)
                stream = apply(val, comp(
                    retain(start),
                    remove(val.slice(start, -1*difflen))
                ))
                update()
            } else {
                log('content added', [start,end], difflen)
                let beforeInsert = v.slice(0,start-difflen)
                stream = apply(val, comp(
                    retain(beforeInsert.length),
                    insert(v.slice(start-difflen,start))
                ))
                update()
            }

            val = v
        }

    const t1 = edit(stream)

    const form = () => {
        return [
            m('style', {type: 'text/css', config: el => el.innerText=css}),
            m('form', m('textarea', {rows: 5, onkeyup:t1, value:stream, placeholder:'type here'})),
            m('form', m('textarea#a', {rows: 5, value:stream}))
        ]
    }

    mount(form, qs())
}
require('universal-utils').then(app)

6. as you can see, there's a lot of implementation involved in consuming this file; when creating the opchain, we have to re-read the value of the text and generate the array of operations that produced that change, and then send that generated opchain over-the-wire. While complex, this allows us to communicate chronological sequences of action taken by a user as they type up a document, making it possible gracefully handle updates to a shared document (i.e. Google Docs) that many people are simultaneously editing.

**/