var utils = require('../utils');

var ControllerBinder = require('../controllerBinder').ControllerBinder;
var ExpressActionBinding = require('./actionBindings').ExpressActionBinding;

function ExpressControllerBinder(controller, controllerFactory) {
  ControllerBinder.call(this, controller, controllerFactory);
}

utils.inherits(ExpressControllerBinder, ControllerBinder);

ExpressControllerBinder.prototype.bind = function(express) {
  var controller = this.controller,
    factory = this.controllerFactory;

  this.bindActions(function(action) {
    new ExpressActionBinding(controller, action, factory)
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
