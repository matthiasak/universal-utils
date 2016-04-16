'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var is = exports.is = function is(type, value) {
    if (type && type.isValid instanceof Function) {
        return type.isValid(value);
    } else if (type === String && (value instanceof String || typeof value === 'string') || type === Number && (value instanceof Number || typeof value === 'number') || type === Boolean && (value instanceof Boolean || typeof value === 'boolean') || type === Function && (value instanceof Function || typeof value === 'function') || type === Object && (value instanceof Object || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') || type === undefined) {
        return true;
    }

    return false;
};

var check = function check(types, required, data) {
    Object.keys(types).forEach(function (key) {
        var t = types[key],
            value = data[key];

        if (required[key] || value !== undefined) {
            if (!(t instanceof Array)) t = [t];

            var i = t.reduce(function (a, _type) {
                return a || is(_type, value);
            }, false);
            if (!i) {
                throw '{' + key + ': ' + JSON.stringify(value) + '} is not one of ' + t.map(function (x) {
                    return '\n - ' + x;
                });
            }
        }
    });

    return true;
};

var Model = exports.Model = function Model() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var types = void 0,
        required = void 0,
        logic = void 0;
    args.map(function (x) {
        if (x instanceof Function && !logic) {
            logic = x;
        } else if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object') {
            if (!types) {
                types = x;
            } else if (!required) {
                required = x;
            }
        }
    });

    var isValid = function isValid(data) {
        var pipe = logic ? [check, logic] : [check];
        return pipe.reduce(function (a, v) {
            return a && v(types || {}, required || {}, data);
        }, true);
    };

    var whenValid = function whenValid(data) {
        return new Promise(function (res, rej) {
            return isValid(data) && res(data);
        });
    };

    return { isValid: isValid, whenValid: whenValid };
};

var ArrayOf = exports.ArrayOf = function ArrayOf(M) {
    return Model(function (t, r, data) {
        if (!(data instanceof Array)) throw data + ' not an Array';
        data.map(function (x) {
            if (!is(M, x)) throw x + ' is not a model instance';
        });
        return true;
    });
};

/**
Use it


// create a Name model with required first/last,
// but optional middle
let Name = Model({
    first: String,
    middle: String,
    last: String
}, {first:true, last:true})

// create a Tags model with extra checks
let Tags = Model((types,required,data) => {
    if(!(data instanceof Array)) throw `${data} not an Array`
    data.map(x => {
        if(!is(String, x))
            throw `[${data}] contains non-String`
    })
    return true
})

// create a Price model that just has a business logic fn
let Price = Model((t,r,d) => {
    return (d instanceof Number || typeof d === 'number') && d !== 0
})

// create an Activity model with a required type and name,
// all others optional
let Activity = Model({
    type: [String, Function, Number],
    latlng: Array,//LatLng,
    title: String,
    tags: Tags,
    name: Name,
    price: Price
}, {name:true, price: true})

// create a new Activity instance, throwing errors if there are
// any invalid fields.
let a = {
    tags: ['1','2'],
    type: 1,
    name: {first:'matt',last:'keas'},
    price: 100.43,
    url: 'http://www.google.com'
}
Activity.whenValid(a).then(log).catch(e => log(e+''))
**/