var utils = require('./utils');
var assert = require('assert');
var fs = require('fs');
var path = require('path');

function getType(o) {
    if (Array.isArray(o)) {
        return 'array';
    }
    return typeof(o);
}

function withOverloads(overloads) {
    return function () {
        var self = this;
        var args = Array.prototype.slice.call(arguments);
        var argTypes = args.map(getType);

        var argCount = argTypes.length, fn;

        overloads.some(function (overload) {
            if (overload.length === argCount + 1) {
                var match = true;
                for (var i = 0; match && i < argCount; i++) {
                    match = overload[i] === argTypes[i];
                }

                if (match) {
                    fn = overload[overload.length - 1];
                }
            }

            return fn;
        });

        if (fn) {
            return fn.apply(self, arguments);
        }

        throw new Error('cannot invoke function with arguments [' + argTypes.join(', ') + ']');
    };
}

function split_arr(arr) {
    var args = arr.slice(0, -1);
    var fn = arr.slice(-1)[0];

    return {
        options: {args: args},
        fn: fn
    };
}


/**
 *
 * @param path
 * @param options
 * @param fn
 * @return {*}
 * @constructor
 *
 *
 * Route(path, fn)
 * Route(options, fn)
 * Route(path, options, fn)
 *
 */
var Route = withOverloads([
    ['string', 'function', function (path, fn) {
        return route_fn(path, null, fn);
    }],
    ['object', 'function', function (options, fn) {
        return route_fn(null, options, fn);
    }],
    ['string', 'object', 'function', route_fn],

    //['string',  'object', 'array', route_arr],
    //['string', 'array',  function(path, arr)    { return route_arr(path, null, arr); }],
    //['options', 'array', function(options, arr) { return route_arr(null, options, arr); }]
]);


function route_fn(path, options, fn) {
    options = utils.extend({}, options);

    if (path) {
        options.path = path;
    }

    fn.route = options;
    return fn;
}

function route_arr(path, options, arr) {
    var parts = split_arr(arr);

    options = utils.extend({}, options, parts.options);

    return route_fn(path, options, parts.fn);
}


function concat(item, args) {
    return [item].concat(Array.prototype.slice.call(args));
}

Route.httpIgnore = function (fn) {
    fn.route = {ignore: true};
    return fn;
};

/**
 *
 * @param path
 * @param options
 * @param fn
 * @return {*}
 *
 * Route.httpGet(options, actionHandler)
 * Route.httpGet(path, options, actionHandler)
 */
Route.httpGet = function (path, options, fn) {
    return Route.http.apply(null, ['get'].concat(Array.prototype.slice.call(arguments)));
};

/**
 *
 * @param path
 * @param options
 * @param fn
 * @return {*}
 *
 * Route.httpGet(options, actionHandler)
 * Route.httpGet(path, options, actionHandler)
 *
 */
Route.httpPut = function (path, options, fn) {
    return Route.http.apply(null, ['put'].concat(Array.prototype.slice.call(arguments)));
};

/**
 *
 * @param path
 * @param options
 * @param fn
 * @return {*}
 *
 * Route.httpPost(options, actionHandler)
 * Route.httpPost(path, options, actionHandler)
 *
 */
Route.httpPost = function (path, options, fn) {
    return Route.http.apply(null, ['post'].concat(Array.prototype.slice.call(arguments)));
};

/**
 *
 * @param path
 * @param options
 * @param fn
 * @return {*}
 *
 * Route.httpDelete(options, actionHandler)
 * Route.httpDelete(path, options, actionHandler)
 *
 */
Route.httpDelete = function (path, options, fn) {
    return Route.http.apply(null, ['delete'].concat(Array.prototype.slice.call(arguments)));
};


/**
 * Route.http(options, actionHandler)
 * Ex.:
 * Route.http({
 *      verb: 'get',
 *      path: '/api/users/:id',
 *      args: [],
 *      before: [],
 *      after: []
 *    },
 *    fn)
 *
 * Route.http(verb, options, actionHandler)
 * Ex.:
 * Route.http(
 *    'get',
 *    {
 *      path: '/api/users/:id',
 *      args: [],
 *      before: [],
 *      after: []
 *    },
 *    fn)
 *
 * Route.http(verb, path, options, actionHandler)
 * Ex.:
 * Route.http(
 *    'get',
 *    '/api/users/:id',
 *    {
 *      args: [],
 *      before: [],
 *      after: []
 *    },
 *    fn)
 *
 * @param verb
 * @param path
 * @param options
 * @param fn
 * @return {*}
 */
Route.http = withOverloads([
    ['object', 'function', function (options, fn) {
        return http_fn(null, null, options, fn);
    }],
    ['string', 'function', function (verb, fn) {
        return http_fn(verb, null, null, fn);
    }],
    ['object', 'array', function (options, arr) {
        return http_arr(null, null, options, arr);
    }],
    ['string', 'array', function (verb, arr) {
        return http_arr(verb, null, null, arr);
    }],

    ['string', 'string', 'function', function (verb, path, fn) {
        return http_fn(verb, path, null, fn);
    }],
    ['string', 'object', 'function', function (verb, options, fn) {
        return http_fn(verb, null, options, fn);
    }],
    ['string', 'string', 'array', function (verb, path, arr) {
        return http_arr(verb, path, null, arr);
    }],
    ['string', 'object', 'array', function (verb, options, arr) {
        return http_arr(verb, null, options, arr);
    }],

    ['string', 'string', 'object', 'function', http_fn],
    ['string', 'string', 'object', 'array', http_arr],
]);

function http_fn(verb, path, options, fn) {

    options = options || {};

    if (verb) {
        options.verb = verb;
    }

    if (path) {
        options.path = path;
    }

    fn.route = options;
    return fn;
}

function http_arr(verb, path, options, arr) {
    var parts = split_arr(arr);

    options = utils.extend({}, options, parts.options);

    return http_fn(verb, path, options, parts.fn);
}

module.exports.Route = Route;
