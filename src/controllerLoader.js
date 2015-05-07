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

    options = utils.extend({}, ControllerLoader.defaultOptions, options);

    this.controllerDir = path.resolve(process.cwd(), options.controllerDir);
    this.controllerSuffix = options.controllerSuffix.replace(/.*?\.js$/, '');
}

utils.inherits(ControllerLoader, EventEmitter);

ControllerLoader.defaultOptions = {
    controllerDir: './controllers',
    controllerSuffix: 'controller'
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

    var basename = path.basename(file, this.controllerSuffix + '.js');

    return basename != file ? basename : null;
};

module.exports = ControllerLoader;
