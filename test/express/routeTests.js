var util = require('util');
var assert = require('chai').assert;
var rsvp = require('rsvp');
var httpMocks = require('node-mocks-http');
var Route = require('../../src/route').Route;
var expressMvc = require('../../src/express/index');

suite('express/routeTests', function () {

    var next = function () {
    };

    test('controller1', function () {
        var output = [];
        var disposeCount = 0;

        var UsersController = Route('/api/users', function () {

        });

        UsersController.prototype.dispose = function () {
            output.push(['dispose', ++disposeCount]);
        };

        UsersController.prototype.list = function () {
            output.push(['list']);
            return 'abc';
        };

        UsersController.prototype.get = function (id) {
            output.push(['get', id]);
            return 'abc';
        };

        UsersController.prototype.create = function (userData) {
            output.push(['post', userData]);
        };

        UsersController.prototype.update = function (id, userData) {
            output.push(['put', id, userData]);
        };

        UsersController.prototype.delete = function (id) {
            output.push(['delete', id]);
        };

        var router = expressMvc.routerFromController(UsersController);

        var req = httpMocks.createRequest({
            method: 'get',
            url: '/api/users'
        });
        var res = httpMocks.createResponse();

        router.handle(req, res, next);

        req = httpMocks.createRequest({
            method: 'get',
            url: '/api/users/123',
            params: {
                id: '123'
            }
        });

        res = httpMocks.createResponse();
        router.handle(req, res, next);

        assert.deepEqual(
            output,
            [
                ['list'],
                ['dispose', 1],
                ['get', '123'],
                ['dispose', 2]
            ]);
    });

    test('controller -- usage', function () {
        // api/users
        var UserController = Route('/api/users', function (userManager) {
            this.users = {};
        });

        UserController.$inject = ['userManager'];

        // GET api/users
        //
        // Alternatives:
        //  UserController.prototype.get = function() {  };
        //  UserController.prototype.index = function() {  }; <-- should return View?

        Route.httpGet('',
            UserController.prototype.getUsers = function () {

            });


        // GET api/users/:id
        //
        // Alternatives:
        //  UserController.prototype.get = function(id) {  };
        //  UserController.prototype.index = function(id) {  }; <-- should return View?

        Route.httpGet('/:id',
            UserController.prototype.getUser = function (id) {
                return this.users[id];
            });

        // POST api/users
        //
        // Alterntives:
        //  UserController.prototype.post = function(userData) { };
        //  UserController.prototype.create = function(userData) { };

        Route.httpPost('/', [
            function userData(req) {
                return req.body;
            },
            UserController.prototype.createUser = function (userData) {

            }]);

        // PUT api/users/:id
        //
        // Alterntives:
        //  UserController.prototype.put = function(id, userData) { };
        //  UserController.prototype.update = function(id, userData) { };

        Route.httpPut('/:id', [
            function id(req) {
                return req.params.id;
            },
            function userData(req) {
                return req.body;
            },
            UserController.prototype.updateUser = function (id, userData) {

            }]);

        // DELETE api/users/:id
        // PUT api/users/:id
        //
        // Alterntives:
        //  UserController.prototype.delete = function(id) { };

        Route.httpDelete('/:id',
            UserController.prototype.deleteUser = function (id) {

            });

        /*

         Alternatives:

         function UserController(){
         ...
         }

         UserController.route = { path: '/users' };

         UserController.prototype.deleteUser = function(id) {
         ...
         }

         UserController.prototype.deleteUser.route = {
         verb: 'delete',
         path: '/:id',
         args: [
         function(req){ return req.params.id; }
         ]
         };

         */
    });
});
