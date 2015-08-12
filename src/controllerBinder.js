var utils = require('./utils');
var actionMappings = require('./actionMappings');
var debug = require('debug')('mvc:controllerBinder');

/**
 * @class ControllerBinder
 */

/**
 *
 * @param controller
 * @param controllerFactory
 * @constructor
 */
function ControllerBinder(controller, controllerFactory) {
    this.controller = controller;
    this.controller.route = utils.extend({}, controller.route);
    this.controllerFactory = ensureControllerFactory(controller, controllerFactory);
}

function defaultControllerFactory(controller) {
    return function (context) {
        var o = Object.create(controller.prototype);
        controller.call(o);
        return o;
    };
}

function ensureControllerFactory(controller, controllerFactory) {
    if (!controllerFactory) {
        controllerFactory = defaultControllerFactory(controller);
    }

    /*
     Pass the ctor function so you can use it in the custom controller factory (hint: IOC/DI) like this:

     function (controller) {
     var c = Object.create(controller);
     controller.call(o);
     }

     */

    return controllerFactory.bind(null, controller);
}

ControllerBinder.prototype.bindActions = function (actionBinder) {

    debug(utils.format('BEGIN: %s (%s)', this.controller.route.path, this.controller.route.src));

    this
        .getActions()
        .forEach(actionBinder);

    debug(utils.format('END: %s (%s)', this.controller.route.path, this.controller.route.src));
};

ControllerBinder.prototype.getActions = function () {
    var proto = this.controller.prototype;
    var actions = [];

    Object.keys(proto).forEach(function(name) {
        if (isValidAction(proto, name)) {
            var action = proto[name];

            ensureActionMapping(action, name);

            actions.push(action);
        }
    });

    return actions;
};

function ensureActionMapping(action, name) {
    var defaultMapping = actionMappings.getDefaultMapping(name);
    var mapping = actionMappings.getMappings(name);
    var meta = {name: name};

    action.route = utils.extend({}, defaultMapping, mapping, action.route, meta);

    return action;
}
var reservedNonActionMethods = ['dispose'];

function isValidAction(controller, name) {
    var val = controller[name];
    if (utils.isFunction(val)) {

        if (val.route) {
            return !val.route.ignore;
        }

        return !!actionMappings.getMappings(name);  //return name[0] !== '_' && reservedNonActionMethods.indexOf(name) < 0;
    }
    return false;
}

module.exports.ControllerBinder = ControllerBinder;

