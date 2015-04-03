var utils = require('./utils');

var list = {verb: 'get', path: ''},
    get = {verb: 'get', path: '/:id', args: [getRequestParam('id')]},
    put = {verb: 'put', path: '/:id', args: [getRequestParam('id'), getBodyValue()]},
    post = {verb: 'post', path: '', args: [getBodyValue()]},
    destroy = {verb: 'delete', path: '/:id', args: [getRequestParam('id')]};

var actionMappings = {
    'list': list,

    'get': get,
    'index': get,

    'put': put,
    'update': put,

    'post': post,
    'create': post,

    'delete': destroy,
    'destroy': destroy
};

function getDefaultMapping(name) {
    return {
        verb: 'get',
        path: '/' + name.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1).map(function (s) {
            return s.toLowerCase();
        }).join('/')
    };
}

function getMappings(name) {
    return actionMappings[name];
}

function getRequestParam(name) {
    return function (req) {
        return req.params[name];
    };
}

function getRequestValue(name) {
    return function (req) {
        return req[name];
    };
}

function getBodyValue(name) {
    if (name) {
        return function (req) {
            return req.body[name];
        };
    }

    return function (req) {
        return req.body;
    };
}

function getQueryParam(name, req) {
    return function (req) {
        return req.query[name];
    };
}

function getValue(name) {
    var param = getRequestParam(name);
    var body = getBodyValue(name);
    var query = getQueryParam(name);

    return function (req) {
        return param(req) || body(req) || query(req);
    };
}


function getArgValueAccessor(src) {
    switch (src) {
        default:
            //case 'params':
            //case 'url':
            return getRequestParam;

        case 'body':
            return getBodyValue;

        case 'query':
            return getQueryParam;

        case 'request':
            return getRequestValue;
    }
}

function resolveArgumentMapping(mapping) {
    if (utils.isFunction(mapping)) {
        // Ex.: function (req) { return req.body.name; }
        return mapping;
    }

    if (utils.isString(mapping)) {
        // Ex.: 'name' -> (req.params.name || req.body.name || req.query.name)
        return getValue(mapping);
    }

    if (utils.isObject(mapping)) {
        // Ex.: { src: 'body', name: 'firstName' }
        return getArgValueAccessor(mapping.src)(mapping.name);
    }

    throw new Error('Invalid argument mapping');
}

module.exports.getDefaultMapping = getDefaultMapping;
module.exports.getMappings = getMappings;
module.exports.getRequestParam = getRequestParam;
module.exports.getBodyValue = getBodyValue;
module.exports.getQueryParam = getQueryParam;
module.exports.getValue = getValue;

module.exports.resolveArgumentMapping = resolveArgumentMapping;
