var path = require('path');
var assert = require('chai').assert;

var ControllerLoader = require('../src/controllerLoader');


suite('controller loaded tests', function () {
    test('cannot load controller from module with errors', function() {
        new ControllerLoader({
            //controllerDir: path.resolve(__dirname, './controllers')
        }).beginLoad();
    })
})