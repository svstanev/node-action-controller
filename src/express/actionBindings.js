var debug = require('debug')('mvc:action');

var path = require('path');
var assert = require('assert');

var StringBuilder = require('stringbuilder');
var utils = require('../utils');
var functionUtils = require('../functionUtils');
var Result = require('./result');

var ActionBinding = require('../actionBindings').ActionBinding;

function ExpressActionBinding(controller, action, options) {
    ActionBinding.call(this, controller, action, options.controllerFactory);

    this.transformError = options.transformError;
    this.transformResult = options.transformResult;
}

utils.inherits(ExpressActionBinding, ActionBinding);

ExpressActionBinding.prototype.resolveArguments = function (args) {
    return args.map(resolveArgumentMapping);
};

ExpressActionBinding.prototype.resolveExpressAction = function (express) {
    var verb = (this.action.route.verb || 'get').toLowerCase();

    return express[verb];
};

ExpressActionBinding.prototype.prepareActionHandler = function () {
    return prepareHandlers(
        this.controller,
        this.action,
        this.onRequestReceived.bind(this));
};

ExpressActionBinding.prototype.bind = function (express) {
    var handlers = this.prepareActionHandler();

    this.resolveExpressAction(express).call(express, this.getPath(), handlers);

    this.logBinding();
};

ExpressActionBinding.prototype.onRequestReceived = function (req, res, next) {
    var args = this.getActionArguments().map(function (arg) {
        return arg(req, res, next);
    });

    // Disposing the controller instance BEFORE moving to the next handler/middlerware.
    // Not that this is of a big concern but looks like a better workflow/controller live cycle
    var nextCalled, nextArgs;

    function nextCallback() {
        nextCalled = true;
        nextArgs = Array.prototype.slice(arguments);
    }

    var context = {
        request: req,
        response: res
    };

    var controllerInstance = this.createControllerInstance(context);
    try {
        this.invokeAction(controllerInstance, args, res, nextCallback);
    }
    finally {
        var dispose = controllerInstance.dispose;
        if (utils.isFunction(dispose)) {
            try {
                dispose.call(controllerInstance);
            }
            catch (err) {
                this.logError('Error disposing controller', err);
            }
        }

        if (nextCalled) {
            next.apply(null, nextArgs);
        }
    }
};

ExpressActionBinding.prototype.invokeAction = function (controller, args, res, next) {
    var result;
    try {
        result = this.action.apply(controller, args);
    }
    catch (err) {
        this.logError('Error on action invocation', err);
        result = this.translateErrorToResult(err);
    }

    if (utils.isPromise(result)) {
        this.handlePromise(result, res, next);
    }
    else {
        this.renderResult(result, res, next);
    }
};

ExpressActionBinding.prototype.translateErrorToResult = function(err) {
    if (utils.isFunction(this.transformError)) {
        return this.transformError(err);
    }

    return Result.InternalError(err);
}

ExpressActionBinding.prototype.renderResult = function (result, res, next) {
    if (!result || !result.render) {
        result = Result.toResult(result);
    }

    result.render(res, next);
};

ExpressActionBinding.prototype.handlePromise = function (promise, res, next) {
    var self = this;

    promise
        .catch(function (err) {
            self.logError('Error invoking action (promise rejected)', err);
            return self.translateErrorToResult(err);
        })
        .then(function (result) {
            self.renderResult(result, res, next);
        });
};

ExpressActionBinding.prototype.logError = function (description, err) {

    if (!err) {
        err = description;
        description = 'ERROR';
    }

    new StringBuilder()
        .appendLine()
        .appendLine('{0}:', description)
        .appendLine(
        '\tAction: {0} {1} - {2}',
        this.action.route.verb.toUpperCase(),
        this.getPath(),
        this.action.route.name)
        .appendLine('\tController: {0}', this.controller.route.src)
        .appendLine('\tError:')
        .append('\t\t{0}', err.message || err)
        .append('\t\t{0}', err.stack || '<No stack trace available>')
        .toString(function (err, str) {
            debug(str);
        })
    ;
};

ExpressActionBinding.prototype.logBinding = function () {
    debug(
        utils.format(
            'MVC action: %s %s - %s',
            this.action.route.verb.toUpperCase(),
            this.getPath(),
            this.action.route.name));
};

function prepareHandlers(controller, action, actionHandler) {
    var controllerRoute = controller.route || {},
        actionRoute = action.route || {};

    return new HandlerList()
        .add(controllerRoute.before)
        .add(actionRoute.before)
        .add(actionHandler)
        .add(actionRoute.after)
        .add(controllerRoute.after)
        .toArray();
}

/**
 * @class HandlerList
 *
 */
function HandlerList() {
    var handlers = [];

    function addHandler(handler) {
        if (utils.isFunction(handler)) {
            handlers.push(handler);
        }
    }

    return {
        add: function (handlers) {
            if (Array.isArray(handlers)) {
                handlers.forEach(addHandler);
            }
            else {
                addHandler(handlers);
            }
            return this;
        },

        toArray: function () {
            return handlers;
        }
    };
}


module.exports.ExpressActionBinding = ExpressActionBinding;

/*
 function ExpressRouterActionBinding(controller, action, controllerFactory) {
 ExpressActionBinding.call(this, controller, action, controllerFactory);
 }

 utils.inherits(ExpressRouterActionBinding, ExpressActionBinding);

 module.exports.ExpressRouterActionBinding = ExpressRouterActionBinding;
 */



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
    return function (req) {
        return req.body[name];
    };
}

function getQueryParam(name, req) {
    return function (req) {
        return req.query[name];
    };
}

function getOther(name) {
    return function(req) {
        switch (name) {
            case 'body':
            case 'data':
                return req.body;

            default:
                return null;
        }
    }
}

function getValue(name) {
    var param = getRequestParam(name);
    var body = getBodyValue(name);
    var query = getQueryParam(name);
    var other = getOther(name);

    return function (req) {
        return param(req) || query(req) || body(req) || other(req);
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
