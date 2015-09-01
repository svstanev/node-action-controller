var initControllersCore = require('../init').initControllers;
var utils = require('../utils');
var ExpressControllerBinder = require('./controllerBinder').ExpressControllerBinder;

function initControllers(express, options, controllerFactory) {

    controllerFactory = controllerFactory || options.controllerFactory || options.factory;

    var binderOptions = {
        controllerFactory: controllerFactory,
        transformResult: options.transformResult,
        transformError: options.transformError
    };

    var controllerBinder = function (controller) {
        new ExpressControllerBinder(controller, binderOptions)
            .bind(express);
    };

    initControllersCore(options, controllerBinder);

    return express;
}

function routerFromController(controller, options) {
    return bindController(require('express').Router(), controller, options);
}

function bindController(express, controller, options) {
    options = options || {};

    if (utils.isFunction(options)) {
        options = {
            factory: options
        };
    }

    var controllerFactory = options.controllerFactory || options.factory;

    var binderOptions = {
        controllerFactory: controllerFactory,
        transformResult: options.transformResult,
        transformError: options.transformError
    };

    new ExpressControllerBinder(controller, binderOptions)
        .bind(express);

    return express;
}

//module.exports.initControllers = initControllers;
module.exports.routerFromController = routerFromController;
module.exports.bindController = bindController;

module.exports.middleware = function express_middleware(options, controllerFactory) {
    return initControllers(require('express').Router(), options, controllerFactory);
};

module.exports.Result = require('./result');
