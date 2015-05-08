var utils = require('../utils');

var ControllerBinder = require('../controllerBinder').ControllerBinder;
var ExpressActionBinding = require('./actionBindings').ExpressActionBinding;

function ExpressControllerBinder(controller, options) {
    ControllerBinder.call(this, controller, options.controllerFactory);

    this.transformError = options.transformError;
    this.transformResult = options.transformResult;
}

utils.inherits(ExpressControllerBinder, ControllerBinder);

ExpressControllerBinder.prototype.bind = function (express) {
    var controller = this.controller,
        factory = this.controllerFactory;

    var binderOptions = {
        controllerFactory: factory,
        transformError: this.transformError,
        transformResult: this.transformResult
    }

    this.bindActions(function (action) {
        new ExpressActionBinding(controller, action, binderOptions)
            .bind(express);
    });
};

module.exports.ExpressControllerBinder = ExpressControllerBinder;

/*
 function ExpressRouterControllerBinder(controller, controllerFactory) {
 ControllerBinder.call(this, controller, controllerFactory);
 }

 utils.inherits(ExpressRouterControllerBinder, ControllerBinder);

 ExpressRouterControllerBinder.prototype.bind = function(router) {
 var controller = this.controller,
 factory = this.controllerFactory;

 this.bindActions(function(action) {
 new actionBindings.ExpressRouterActionBinding(controller, action, factory)
 .bind(router);
 });
 };


 module.exports.ExpressRouterControllerBinder = ExpressRouterControllerBinder;
 */
