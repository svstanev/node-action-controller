var assert = require('chai').assert;
var rsvp = require('rsvp');
var httpMocks = require('node-mocks-http');

var ControllerBinder = require('../src/controllerBinder').ControllerBinder;

function getActionName(action) {
    return action.route.name;
}

function getActionPath(action) {
    return action.route.path;
}

suite('controller binder tests', function () {

    suite('controllerFactory', function () {
        test('default controller factory if no provided', function () {
            function MyController() {
            }

            var binder = new ControllerBinder(MyController);

            assert.isFunction(binder.controllerFactory);
            assert.instanceOf(binder.controllerFactory(), MyController);
        });

        test('external controller factory', function () {
            var log = [];

            function MyController() {
            }

            function myControllerFactory() {
                log.push('myControllerFactory');
                return new MyController();
            }

            var binder = new ControllerBinder(MyController, myControllerFactory);

            assert.isFunction(binder.controllerFactory);

            // NOTE: the custom controller factory may return whatever it finds appropriate
            assert.instanceOf(binder.controllerFactory(), MyController);

            assert.deepEqual(log, ['myControllerFactory']);
        });
    });

    suite('getActions', function () {
        var actions;

        setup(function () {
            actions = new ControllerBinder(require('./controllers/api/usersController'))
                .getActions();
        });

        test('should return array of functions', function () {
            assert.isArray(actions);

            actions.forEach(function (action) {
                assert.isFunction(action);
            });
        });

        test('all actions should have the route attribution', function () {
            actions.forEach(function (action) {
                assert.isObject(action.route, 'route');
                assert.includeMembers(['get', 'put', 'post', 'delete'], [action.route.verb], 'verb');
                assert.isString(action.route.path, 'path');
                assert.isString(action.route.name, 'name');
            });
        });

        test('dispose is never mapped to a controller action', function () {
            var actionNames = actions.map(getActionName);

            assert(actionNames.indexOf('dispose') < 0);
        });

        test('ignored methods (Route.httpIgnore) is never mapped to a controller action', function () {
            var actionNames = actions.map(getActionName);

            assert(actionNames.indexOf('notAnAction') < 0);
        });

        test('methods with names starting with _ are not mapped to a controller actions', function () {
            var actionNames = actions.map(getActionName);

            assert(actionNames.indexOf('_notAnAction') < 0);
            assert(actionNames.indexOf('__notAnAction') < 0);
        });

        test('order of actions according to the paths', function () {
            var actionProperties = actions.map(function (a) {
                return [a.route.name, a.route.path];
            });

            console.log(actionProperties.join('\n'));

            assert.deepEqual(
                actionProperties,
                [
                    ['newReport', '/projects/:projectId/reports/new'],
                    ['getReport', '/projects/:projectId/reports/:id'],
                    ['newProject', '/projects/new'],
                    ['getProject', '/projects/:id'],
                    ['get', '/:id'],
                    ['list', ''],
                ]);
        });

    });


});
