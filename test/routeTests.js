var util = require('util');
var assert = require('chai').assert;
var Route = require('../src/route').Route;

suite('routeTests', function () {

    var next = function () {
    };

    test('httpGet', function () {
        function action(name) {
            return ('' + name).toUpperCase();
        }

        var result = Route.httpGet('/name', action);

        assert.equal(result, action);
        assert.deepEqual(action.route, {verb: 'get', path: '/name'});
    });

    test('httpPut', function () {
        function action(name) {
            return ('' + name).toUpperCase();
        }

        var result = Route.httpPut('/name', action);

        assert.equal(result, action);
        assert.deepEqual(action.route, {verb: 'put', path: '/name'});
    });

    test('httpPost', function () {
        function action(name) {
            return ('' + name).toUpperCase();
        }

        var result = Route.httpPost('/name', action);

        assert.equal(result, action);
        assert.deepEqual(action.route, {verb: 'post', path: '/name'});
    });

    test('httpDelete', function () {
        function action(name) {
            return ('' + name).toUpperCase();
        }

        var result = Route.httpDelete('/name', action);

        assert.equal(result, action);
        assert.deepEqual(action.route, {verb: 'delete', path: '/name'});
    });

    test('http', function () {
        function action(name) {
            return name;
        }

        var result = Route.http('HEAD', '/name', {args: [1, 2, 3]}, action);

        assert.equal(result, action);
        assert.deepEqual(action.route, {verb: 'HEAD', path: '/name', args: [1, 2, 3]});
    });

    test('Route', function () {
        function UsersController() {

        }

        var usersController = Route('/api/users', UsersController);

        assert.equal(UsersController, usersController);
        assert.deepEqual(usersController.route, {path: '/api/users'});
    });

    test('array of args and function', function () {
        function myAction() {
        }

        var action = Route.httpGet([1, 2, 3, myAction]);

        assert.deepEqual({verb: 'get', args: [1, 2, 3]}, action.route);
        assert.strictEqual(action, myAction);
    });

    test('path and array', function () {
        function myAction() {
        }

        var action = Route.httpGet('/path/to/my/resource/action', [1, 2, 3, myAction]);

        assert.deepEqual({verb: 'get', args: [1, 2, 3], path: '/path/to/my/resource/action'}, action.route);
        assert.strictEqual(action, myAction);
    });

    test('path, options and array', function () {
        function myAction() {
        }

        var action = Route.httpGet('/path/to/my/resource/action', {prop: 'abc'}, [1, 2, 3, myAction]);

        assert.deepEqual({
            verb: 'get',
            args: [1, 2, 3],
            path: '/path/to/my/resource/action',
            prop: 'abc'
        }, action.route);
        assert.strictEqual(action, myAction);
    });
});
