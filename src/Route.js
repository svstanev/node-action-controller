var utils = require('./utils');
var withOverloads = require('./functionUtils').withOverloads;

var slice =  Array.prototype.slice;

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
        return route(path, null);
    }],

    ['object', function (options) {
        return route(null, options);
    }],

    ['string', 'object', route],

    //['string',  'object', 'array', route_arr],
    //['string', 'array',  function(path, arr)    { return route_arr(path, null, arr); }],
    //['options', 'array', function(options, arr) { return route_arr(null, options, arr); }]
]);


function route(path, options) {
    return function(target, key, descriptor) {
        var controller = typeof target === 'function' ? target : descriptor.value;
        var route = controller.route || {};

        utils.extend(route, options);

        if (path) {
            route.path = path;
        }

        controller.route = route;

        return descriptor || controller;
    }
}

/**
 *
 */
Route.httpArgs = function() {
    var args = slice.call(arguments);
    return function(target, key, descriptor) {
        var action = utils.isFunction(target) ? target : descriptor.value;
        var route = action.route || {};
        var routeArgs = route.args || [];

        [].push.apply(routeArgs, args);

        route.args = routeArgs;
        action.route = route;

        return descriptor || action;
    };
};

/**
 *
 * @return {Function}
 */
Route.httpIgnore = function (target, key, descriptor) {
    if (arguments.length === 0) {
        return httpIgnore;
    }

    return httpIgnore(target, key, descriptor);
};

function httpIgnore(target, key, descriptor) {
    var action = utils.isFunction(target) ? target : descriptor.value;
    var route = action.route || {};

    route.ignore = true;
    action.route = route;

    return descriptor || action;
}

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
    return Route.http.apply(null, ['get'].concat(slice.call(arguments)));
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
    return Route.http.apply(null, ['put'].concat(slice.call(arguments)));
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
    return Route.http.apply(null, ['patch'].concat(slice.call(arguments)));
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
    return Route.http.apply(null, ['post'].concat(slice.call(arguments)));
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
    return Route.http.apply(null, ['delete'].concat(slice.call(arguments)));
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
        return http(null, null, options);
    }],

    ['string', function (verb) {
        return http(verb, null, null);
    }],

    ['object', 'array', function (options, args) {
        return http_args(null, null, options, args);
    }],

    ['string', 'array', function (verb, args) {
        return http_args(verb, null, null, args);
    }],

    ['string', 'string', function (verb, path) {
        return http(verb, path, null);
    }],

    ['string', 'object', function (verb, options) {
        return http(verb, null, options);
    }],

    ['string', 'string', 'array', function (verb, path, args) {
        return http_args(verb, path, null, args);
    }],

    ['string', 'object', 'array', function (verb, options, args) {
        return http_args(verb, null, options, args);
    }],

    ['string', 'string', 'object', http],

    ['string', 'string', 'object', 'array', http_args],
]);

function http(verb, path, options) {
    return function(target, key, descriptor) {
        var action = utils.isFunction(target) ? target : descriptor.value;
        var route = action.route || {};
        utils.extend(route, options);
        if (verb) {
            route.verb = verb;
        }
        if (path) {
            route.path = path;
        }
        action.route = route;
        return descriptor || action;
    }
}

function http_args(verb, path, options, args) {
    options = utils.extend({}, options, { args: args });

    return http(verb, path, options);
}

module.exports.Route = Route;
