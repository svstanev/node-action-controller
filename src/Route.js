var utils = require('./utils');
var withOverloads = require('./functionUtils').withOverloads;

/**
 *
 * @param path
 * @param options
 * @return {function(controllerConstructor)}
 * @constructor
 *
 *
 * Route(path)(controllerConstructor)
 * Route(options)(controllerConstructor)
 * Route(path, options)(controllerConstructor)
 *
 */
var Route = withOverloads([
    ['string', function (path) {
        return route_decorator(path, null);
    }],

    ['object', function (options) {
        return route_decorator(null, options);
    }],

    ['string', 'object', route_decorator],

    //['string',  'object', 'array', route_arr],
    //['string', 'array',  function(path, arr)    { return route_arr(path, null, arr); }],
    //['options', 'array', function(options, arr) { return route_arr(null, options, arr); }]
]);


function route_decorator(path, options) {
    return function(target, key, descriptor) {
        var fn = arguments.length === 1 ? target : descriptor;

        options = utils.extend({}, options);

        if (path) {
            options.path = path;
        }

        fn.route = options;
        return fn;
    }
}

/**
 *
 * @return {Function}
 */
Route.httpIgnore = function () {
    return function(fn) {
        fn.route = {ignore: true};
        return fn;
    };
};

/**
 *
 * @param path
 * @param options
 * @return {*}
 *
 * Route.httpGet(options)(actionHandler)
 * Route.httpGet(path, options)(actionHandler)
 */
Route.httpGet = function (path, options) {
    return Route.http.apply(null, ['get'].concat(Array.prototype.slice.call(arguments)));
};

/**
 *
 * @param path
 * @param options
 * @return {*}
 *
 * Route.httpPut(options)(actionHandler)
 * Route.httpPut(path, options)(actionHandler)
 *
 */
Route.httpPut = function (path, options) {
    return Route.http.apply(null, ['put'].concat(Array.prototype.slice.call(arguments)));
};


/**
 *
 * @param path
 * @param options
 * @return {*}
 *
 * Route.httpPatch(options)(actionHandler)
 * Route.httpPatch(path, options)(actionHandler)
 *
 */
Route.httpPatch = function (path, options) {
    return Route.http.apply(null, ['patch'].concat(Array.prototype.slice.call(arguments)));
};

/**
 *
 * @param path
 * @param options
 * @return {*}
 *
 * Route.httpPost(options)(actionHandler)
 * Route.httpPost(path, options)(actionHandler)
 *
 */
Route.httpPost = function (path, options) {
    return Route.http.apply(null, ['post'].concat(Array.prototype.slice.call(arguments)));
};

/**
 *
 * @param path
 * @param options
 * @return {*}
 *
 * Route.httpDelete(options)(actionHandler)
 * Route.httpDelete(path, options)(actionHandler)
 *
 */
Route.httpDelete = function (path, options) {
    return Route.http.apply(null, ['delete'].concat(Array.prototype.slice.call(arguments)));
};


/**
 * Route.http(options)(actionHandler)
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
 * Route.http(verb, options)(actionHandler)
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
 * Route.http(verb, path, options)(actionHandler)
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
    ['object', function (options) {
        return http_decorator(null, null, options);
    }],

    ['string', function (verb) {
        return http_decorator(verb, null, null);
    }],

    ['object', 'array', function (options, args) {
        return http_args_decorator(null, null, options, args);
    }],

    ['string', 'array', function (verb, args) {
        return http_args_decorator(verb, null, null, args);
    }],

    ['string', 'string', function (verb, path) {
        return http_decorator(verb, path, null);
    }],

    ['string', 'object', function (verb, options) {
        return http_decorator(verb, null, options);
    }],

    ['string', 'string', 'array', function (verb, path, args) {
        return http_args_decorator(verb, path, null, args);
    }],

    ['string', 'object', 'array', function (verb, options, args) {
        return http_args_decorator(verb, null, options, args);
    }],

    ['string', 'string', 'object', http_decorator],

    ['string', 'string', 'object', 'array', http_args_decorator],
]);

function http_decorator(verb, path, options) {
    return function(target, key, descriptor) {
        var fn = arguments.length === 1 ? target : descriptor;

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
}

function http_args_decorator(verb, path, options, args) {
    options = utils.extend({}, options, { args: args });

    return http_decorator(verb, path, options);
}

module.exports.Route = Route;
