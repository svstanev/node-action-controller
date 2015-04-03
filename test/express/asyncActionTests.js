var assert = require('chai').assert;
var rsvp = require('rsvp');
var httpMocks = require('node-mocks-http');

var Route = require('../../src/route').Route;
var expressMvc = require('../../src/express/index');

suite('async action tests', function () {
    var next = function () {
    };

    test('resolved promise', function (done) {
        var output = [];

        var UsersController = Route('/api/users', function () {

        });

        UsersController.prototype.get = function (id) {
            output.push(['get', id]);
            return new rsvp.Promise(function (resolve, reject) {
                resolve(id || null);
            });
        };

        var router = expressMvc.routerFromController(UsersController);

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/api/users/zzz'
        });

        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});
        res.on('end', function () {
            check(done, function () {
                assert.deepEqual(
                    output,
                    [
                        ['get', 'zzz']
                    ]);

                // get action returns string that is processes as Result object, which res.send(data)
                // Do not check for res._isEndCalled() here as the mockResponse.send() emits 'end' without setting the __endCalled flag
                //assert.ok(res._isEndCalled());

                assert.strictEqual(res._getData(), 'zzz');
            });
        });

        router.handle(req, res, next);
    });

    test('rejected promise', function (done) {
        var output = [];

        var UsersController = Route('/api/users', function () {

        });

        UsersController.prototype.list = function () {
            output.push(['list']);
            return rsvp.reject({message: 'zee error'});
        };

        var router = expressMvc.routerFromController(UsersController);

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/api/users/'
        });
        var res = httpMocks.createResponse({eventEmitter: require('events').EventEmitter});
        res.on('end', function () {

            check(done, function () {
                assert.deepEqual(
                    output,
                    [
                        ['list']
                    ]);

                // Do not check for res._isEndCalled() here as the mockResponse.send() emits 'end' without setting the __endCalled flag
                // assert.ok(res._isEndCalled(), 'end called');

                assert.equal(res._getStatusCode(), 500, 'status code 500');
                assert.deepEqual(res._getData(), {message: 'zee error'}, 'data');
            });
        });

        router.handle(req, res, next);
    });

    function check(done, fn) {
        var err;
        try {
            fn();
        }
        catch (e) {
            err = e;
        }
        done(err);
    }
});
