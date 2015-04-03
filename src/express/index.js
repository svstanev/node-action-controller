var initControllersCore = require('../init').initControllers;
var ExpressControllerBinder = require('./controllerBinder').ExpressControllerBinder;

function initControllers(express, options, controllerFactory) {

    controllerFactory = controllerFactory || options.controllerFactory || options.factory;

    var controllerBinder = function (controller) {
        new ExpressControllerBinder(controller, controllerFactory)
            .bind(express);
    };

    initControllersCore(options, controllerBinder);

    return express;
}

function routerFromController(controller, controllerFactory) {
    return bindController(require('express').Router(), controller, controllerFactory);
}

function bindController(express, controller, controllerFactory) {

    new ExpressControllerBinder(controller, controllerFactory)
        .bind(express);

    return express;
}

module.exports.initControllers = initControllers;
module.exports.routerFromController = routerFromController;
module.exports.bindController = bindController;

module.exports.middleware = function express_middleware(options, controllerFactory) {
    return initControllers(require('express').Router(), options, controllerFactory);
};

module.exports.Result = require('./result');
