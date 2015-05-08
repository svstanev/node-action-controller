var utils = require('./utils');

var list =      { verb: 'get',     path: '' },
    get =       { verb: 'get',     path: '/:id' }, //, args: [getRequestParam('id')]
    put =       { verb: 'put',     path: '/:id' }, //, args: [getRequestParam('id'), getBodyValue()]
    post =      { verb: 'post',    path: '' },     //, args: [getBodyValue()]
    destroy =   { verb: 'delete',  path: '/:id' }, //, args: [getRequestParam('id')]
    patch =     { verb: 'patch',   path: '/:id' }, //, args: [getRequestParam('id'), getBodyValue()]
    options =   { verb: 'options', path: '' }
;

var actionMappings = {
    'list': list,

    'get': get,
    'index': get,

    'put': put,
    'update': put,

    'post': post,
    'create': post,

    'delete': destroy,
    'destroy': destroy,

    'patch': patch,

    'options': options
};

function getDefaultMapping(name) {
    return {
        verb: 'get',
        path: ''    //pathFromActionName(name)
    };
}

function getMappings(name) {
    return actionMappings[name];
}

function pathFromActionName(name) {
    return '/' + name.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1).map(function (s) {
        return s.toLowerCase();
    }).join('/');
}

module.exports.getDefaultMapping = getDefaultMapping;
module.exports.getMappings = getMappings;