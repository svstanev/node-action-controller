function isArray(arg) {
    return Array.isArray(arg);
}

function isFunction(arg) {
    return (typeof arg === 'function');
}

function isNumber(arg) {
    return (typeof arg === 'number');
}

function isString(arg) {
    return (typeof arg === 'string');
}

function isObject(arg) {
    return (typeof arg === 'object');
}

function isPromise(o) {
    return (!!o && isFunction(o.then) && isFunction(o.catch));
}

function isUndefined(arg) {
    return (typeof arg === 'undefined');
}

function extend() {
    var dest = arguments[0],
        args = arguments.length,
        o, prop;
    for (var i = 1; i < args; i++) {
        o = arguments[i];
        if (o) {
            for (prop in o) {
                if (o.hasOwnProperty(prop)) {
                    dest[prop] = o[prop];
                }
            }
        }
    }
    return dest;
}

extend(
    module.exports,
    require('util'),
    {
        isArray: isArray,
        isFunction: isFunction,
        isString: isString,
        isNumber: isNumber,
        isObject: isObject,
        isPromise: isPromise,
        isUndefined: isUndefined,

        extend: extend
    }
);
