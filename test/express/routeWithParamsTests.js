var assert = require('chai').assert;
var httpMocks = require('node-mocks-http');

var Route = require('../../src/route').Route;
var expressMvc = require('../../src/express/index');

suite('express/route with params', function () {

    var next = function () {
    };

    var UserProjectController = Route('/users/:user/projects')(function() {

    });

    UserProjectController.prototype = {
        get: function(user, id) {
            return {
                'get': {
                    'userId': user,
                    'projectId': id
                }
            }
        },

        list: function(user) {
            return {
                'list': {
                    'userId': user,
                }
            }
        },

        post: function(user, data) {
            return {
                'post': {
                    'userId': user,
                    'data': data
                }
            }
        },

        patch: function(user, id, data) {
            return {
                'patch': {
                    'userId': user,
                    'projectId': id,
                    'data': data
                }
            }
        },

        put: function(user, id, data) {
            return {
                'put': {
                    'userId': user,
                    'projectId': id,
                    'data': data
                }
            }
        },

        'delete': function(user, id) {
            return {
                'delete': {
                    'userId': user,
                    'projectId': id
                }
            }
        }
    };

    var router = expressMvc.routerFromController(UserProjectController);

    test('get', function (done) {
        var req = httpMocks.createRequest({
            method: 'get',
            url: '/users/123/projects/456'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});
        res.on('end', function () {
            var err;
            try {
                var data = res._getData();

                assert.deepEqual(data, {
                    get: {
                        userId: '123',
                        projectId: '456'
                    }
                });
            }
            catch (e) {
                err = e;
            }
            done(err);
        });

        router.handle(req, res, next);

    })

    test('list', function (done) {
        var req = httpMocks.createRequest({
            method: 'get',
            url: '/users/123/projects'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});
        res.on('end', function () {
            var err;
            try {
                var data = res._getData();

                assert.deepEqual(data, {
                    list: {
                        userId: '123',
                    }
                });
            }
            catch (e) {
                err = e;
            }
            done(err);
        });

        router.handle(req, res, next);

    })

    test('post', function (done) {
        var req = httpMocks.createRequest({
            method: 'post',
            url: '/users/123/projects',
            body: 'hello world'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});
        res.on('end', function () {
            var err;
            try {
                var data = res._getData();

                assert.deepEqual(data, {
                    post: {
                        userId: '123',
                        data: 'hello world'
                    }
                });
            }
            catch (e) {
                err = e;
            }
            done(err);
        });

        router.handle(req, res, next);

    })

    test('patch', function (done) {
        var req = httpMocks.createRequest({
            method: 'patch',
            url: '/users/123/projects/456',
            body: 'yello'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});
        res.on('end', function () {
            var err;
            try {
                var data = res._getData();

                assert.deepEqual(data, {
                    patch: {
                        userId: '123',
                        projectId: '456',
                        data: 'yello'
                    }
                });
            }
            catch (e) {
                err = e;
            }
            done(err);
        });

        router.handle(req, res, next);

    })

    test('put', function (done) {
        var req = httpMocks.createRequest({
            method: 'put',
            url: '/users/123/projects/456',
            body: 'yello'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});
        res.on('end', function () {
            var err;
            try {
                var data = res._getData();

                assert.deepEqual(data, {
                    put: {
                        userId: '123',
                        projectId: '456',
                        data: 'yello'
                    }
                });
            }
            catch (e) {
                err = e;
            }
            done(err);
        });

        router.handle(req, res, next);

    })

    test('delete', function (done) {
        var req = httpMocks.createRequest({
            method: 'delete',
            url: '/users/123/projects/456'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});
        res.on('end', function () {
            var err;
            try {
                var data = res._getData();

                assert.deepEqual(data, {
                    delete: {
                        userId: '123',
                        projectId: '456'
                    }
                });
            }
            catch (e) {
                err = e;
            }
            done(err);
        });

        router.handle(req, res, next);

    })

})