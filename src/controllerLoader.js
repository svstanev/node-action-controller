var debug = require('debug')('mvc:debug');
var error = require('debug')('mvc:error');

var path = require('path');
var assert = require('assert');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var utils = require('./utils');
var DirectoryWalker = require('./directoryWalker');

function ControllerLoader(options) {
    EventEmitter.call(this);

    var defaultOptions = ControllerLoader.defaultOptions;
    var controllerDir = (options.controllerDir || defaultOptions.controllerDir);

    this.controllerDir = path.resolve(process.cwd(), controllerDir);
}

utils.inherits(ControllerLoader, EventEmitter);

ControllerLoader.defaultOptions = {
    controllerDir: './controllers'
};

ControllerLoader.prototype.beginLoad = function () {
    var controllers = [];

    var loader = this;
    new DirectoryWalker()
        .on('file', function (info) {
            var controller = loader.loadFromFile(info);
            if (controller) {
                controllers.push(controller);
            }
        })
        .on('error', function (err) {
            loader.onError(err);
        })
        .walk(this.controllerDir);

    this.emit('loaded', controllers);

    return this;
};

ControllerLoader.prototype.loadFromFile = function (info) {
    var file = info.file,
        fileDir = info.dir;

    var res = this.getResourceNameForControllerModule(file);
    if (res !== null) {
        var modulePath = path.join(fileDir, file);
        var controller;

        try {
            controller = require(modulePath);
        }
        catch (err) {
            error(utils.format('Error loading module %s - %s', modulePath, err));
        }

        if (utils.isFunction(controller)) {
            controller.route = controller.route || {};

            var route = path.join('/', path.relative(this.controllerDir, fileDir));

            controller.route.path = path.resolve(route, controller.route.path || res);
            controller.route.src = modulePath;

            debug(utils.format('Controller loaded: %s - %s', controller.route.path, modulePath));

            return controller;
        }
    }

    return null;
};

ControllerLoader.prototype.onError = function (info) {

};

ControllerLoader.prototype.getResourceNameForControllerModule = function (file) {
    file = file.toLowerCase();
    var basename = path.basename(file, 'controller.js');
    return basename != file ? basename : null;
};

module.exports = ControllerLoader;
