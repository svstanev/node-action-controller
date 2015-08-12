var path = require('path');
var assert = require('assert');

var utils = require('./utils');
var functionUtils = require('./functionUtils');
//var actionMappings = require('./actionMappings');

/**
 * @class ActionBinding
 */
function ActionBinding(controller, action, controllerFactory) {
    this.controller = controller;
    this.action = action;
    this.controllerFactory = controllerFactory;
}

ActionBinding.prototype.getPath = function () {
    var controllerRoute = this.controller.route || {},
        actionRoute = this.action.route || {},
        controllerPath = controllerRoute.path,
        actionPath = actionRoute.path || '';

    if (controllerPath) {
        return path.join(controllerPath, actionPath);
    }

    return actionPath;
};

ActionBinding.prototype.getArguments = function () {
    return Array.prototype.concat.call(
        getArgumentsForController(this.controller),
        getArgumentsForAction(this.action));
};

ActionBinding.prototype.createControllerInstance = function (context) {
    return this.controllerFactory(context);
};

ActionBinding.prototype.getActionArguments = function () {
    if (!this.actionArguments) {
        this.actionArguments = this.resolveArguments(this.getArguments());
    }

    return this.actionArguments;
};


function resolveArgumentsFromDefinition(action) {
    return functionUtils.getArgNames(action)
        //.map(actionMappings.getValue)
        ;
}

function getArgumentsForAction(action) {
    var args = action.route.args;

    if (Array.isArray(args) && args.length > 0) {
        return args;
    }

    return resolveArgumentsFromDefinition(action);
}

function getArgumentsForController(controller) {
    var args, route = controller.route;

    if (route) {
        args = route.args;
    }

    if (Array.isArray(args)) {
        return args;
    }

    return [];
}


module.exports.ActionBinding = ActionBinding;
