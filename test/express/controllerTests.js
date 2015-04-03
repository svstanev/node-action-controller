var assert = require('chai').assert;
var rsvp = require('rsvp');
var httpMocks = require('node-mocks-http');

var Route = require('../../src/route').Route;
var expressMvc = require('../../src/express/index');
var Result = expressMvc.Result;

suite('controller tests', function () {
    var next = function () {
    };
    test('instantiate/dispose controller for each action', function () {
        var log = [];

        var instanceCount = 0;
        var disposeCount = 0;

        function UsersController() {
            log.push(['ctor', ++instanceCount]);
        }

        UsersController.prototype.dispose = function () {
            log.push(['dispose', ++disposeCount]);
        };

        UsersController.prototype.index = function (id) {
            log.push(['index', instanceCount]);
            return 'index @' + instanceCount;
        };

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/12345'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        var router = expressMvc.routerFromController(UsersController);

        for (var i = 0; i < 3; i++) {
            router.handle(req, res, next);
        }

        assert.deepEqual(
            log, [
                ['ctor', 1],
                ['index', 1],
                ['dispose', 1],

                ['ctor', 2],
                ['index', 2],
                ['dispose', 2],

                ['ctor', 3],
                ['index', 3],
                ['dispose', 3],
            ]);
    });

    test('dependency injection/custom controller factory', function () {

        function UsersController(data) {
            this.data = data;
        }

        UsersController.prototype.index = function () {
            return Result.View('views/index.html', this.data);
        };

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/12345'
        });
        var res = httpMocks.createResponse({
            eventEmitter: require('events').EventEmitter
        });

        var someExternalDataInjectedIntoController = {prop1: 123, prop2: 456};


        var router = expressMvc.routerFromController(UsersController, function () {
            return new UsersController(someExternalDataInjectedIntoController);
        });

        router.handle(req, res, next);

        assert.equal(res._getStatusCode(), 200);
        assert.deepEqual(res._getRenderData(), someExternalDataInjectedIntoController);
        assert.deepEqual(res._getRenderView(), 'views/index.html');
    });

    test('action throws exception', function action_throws_ex() {
        function UsersControllerX() {
        }

        UsersControllerX.prototype.list = function () {
            throw {message: 'something went wrong here'};
        };

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/'
        });
        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        var router = expressMvc.routerFromController(UsersControllerX);

        router.handle(req, res, next);

        assert.equal(res._getStatusCode(), 500);
        assert.deepEqual(res._getData(), {message: 'something went wrong here'});
    });

    test('render view', function () {

        function UsersControllerZ() {
        }

        UsersControllerZ.prototype.index = function (id) {
            return Result.View('views/index.html', {id: id});
        };

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/12345'
        });
        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        var router = expressMvc.routerFromController(UsersControllerZ);

        router.handle(req, res, next);

        assert.equal(res._getStatusCode(), 200);
        assert.deepEqual(res._getRenderData(), {id: '12345'});
        assert.deepEqual(res._getRenderView(), 'views/index.html');
    });

    test('redirect from action', function () {

        function UsersController() {
        }

        UsersController.prototype.index = function (id) {
            return Result.Redirect('/login');
        };

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/12345'
        });
        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        var router = expressMvc.routerFromController(UsersController);

        router.handle(req, res, next);

        assert.equal(res._getStatusCode(), 302);
        assert.deepEqual(res._getRedirectUrl(), '/login');
    });

    test('redirect from action with status code', function () {

        function UsersController() {
        }

        UsersController.prototype.index = function (id) {
            return Result.Redirect(301, '/login');
        };

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/12345'
        });
        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        var router = expressMvc.routerFromController(UsersController);

        router.handle(req, res, next);

        assert.equal(res._getStatusCode(), 301);
        assert.deepEqual(res._getRedirectUrl(), '/login');
    });

    test('action returns error', function () {

        function UsersController() {
        }

        UsersController.prototype.index = function (id) {
            return Result.Error(401, 'Not authorized');
        };

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/12345'
        });
        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        var router = expressMvc.routerFromController(UsersController);

        router.handle(req, res, next);

        assert.equal(res._getStatusCode(), 401);
        assert.deepEqual(res._getData(), 'Not authorized');
    });

    test('default route override', function () {
        var log = [];

        function UsersController() {
            log.push(['ctor']);
        }

        UsersController.prototype.index = Route.httpPut('/api/users/:id', function (id, data) {
            log.push(['index', id]);
            return 'index @' + id;
        });

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        var router = expressMvc.routerFromController(UsersController);

        // GET / should not be handled by the UsersController as we have overwritten the UsersController.index route mapping;
        // this should invoke our next() callback
        router.handle(req, res, function (err) {
            log.push(['next']);
        });

        req = httpMocks.createRequest({
            method: 'put',
            url: '/api/users/123'
        });

        router.handle(req, res, function (err) {
            log.push(['next 2']);
        });

        assert.deepEqual(
            log,
            [
                ['next'],
                ['ctor'],
                ['index', '123']
            ]
        );

    });

    test('before/after filters', function () {
        var log = [];

        function controllerBefore(req, res, next) {
            log.push('BEFORE');
            next();
        }

        function controllerAfter(req, res, next) {
            log.push('AFTER');
            next();
        }

        function actionBefore(req, res, next) {
            log.push('before');
            next();
        }

        function actionAfter(req, res, next) {
            log.push('after');
            next();
        }

        var UsersController = Route('/api/users',
            {before: controllerBefore, after: controllerAfter},
            function () {
                log.push('--- ctor ---');
            });

        UsersController.prototype.dispose = function () {
            log.push('--- dispose ---');
        };

        UsersController.prototype.get = Route.httpGet('/:id', {
            before: actionBefore,
            after: actionAfter
        }, function (id) {
            log.push(['get', id]);

            // continue to the after filters
            return Result.Continue();
        });

        UsersController.prototype.xxx = Route.httpGet('/:id/xxx', {before: actionBefore}, function (id) {
            log.push(['get', 'xxx', id]);

            // continue to the after filters
            return Result.Continue();
        });

        UsersController.prototype.yyy = Route.httpGet('/:id/yyy', {after: actionAfter}, function (id) {
            log.push(['get', 'yyy', id]);

            // continue to the after filters
            return Result.Continue();
        });

        UsersController.prototype.zzz = Route.httpGet('/:id/zzz', function (id) {
            log.push(['get', 'zzz', id]);

            // continue to the after filters
            return Result.Continue();
        });

        var router = expressMvc.routerFromController(UsersController);


        var req = httpMocks.createRequest({method: 'get', url: '/api/users/123'});
        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        router.handle(req, res, next);

        req = httpMocks.createRequest({method: 'get', url: '/api/users/123/xxx'});
        res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        router.handle(req, res, next);

        req = httpMocks.createRequest({method: 'get', url: '/api/users/123/yyy'});
        res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        router.handle(req, res, next);

        req = httpMocks.createRequest({method: 'get', url: '/api/users/123/zzz'});
        res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        router.handle(req, res, next);

        assert.deepEqual(
            log,
            [
                // get /api/users/123
                "BEFORE",
                "before",
                "--- ctor ---",
                ["get", "123"],
                "--- dispose ---",
                "after",
                'AFTER',

                // get /api/users/123/xxx
                "BEFORE",
                "before",
                "--- ctor ---",
                ["get", "xxx", "123"],
                "--- dispose ---",
                'AFTER',

                // get /api/users/123/yyy
                "BEFORE",
                "--- ctor ---",
                ["get", "yyy", "123"],
                "--- dispose ---",
                'after',
                'AFTER',

                // get /api/users/123/zzz
                "BEFORE",
                "--- ctor ---",
                ["get", "zzz", "123"],
                "--- dispose ---",
                'AFTER'
            ]
        );

    });

    test('default action binding', function () {
        var log = [];

        function UsersController() {
        }

        UsersController.prototype.myResources = Route.http({}, function () {
            log.push('myResources');
        });

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/my/resources'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        var router = expressMvc.routerFromController(UsersController);

        router.handle(req, res, next);

        assert.deepEqual(log, ['myResources']);

    });

    test('Route.httpIgnore to avoid binding a prototype member to a controller action', function () {
        var log = [];

        function UsersController() {
            log.push('ctor');
        }

        UsersController.prototype.dispose = function () {
            log.push('disposed');
        };

        UsersController.prototype.justSomePublicMemthod = Route.httpIgnore(function () {
            log.push('justSomePublicMemthod');
        });

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/justSomePublicMemthod'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});

        var router = expressMvc.routerFromController(UsersController);

        router.handle(req, res, next);

        // As there is no matching action to invoke, the controller is never instantiated
        assert.deepEqual(log, []);

    });

});
