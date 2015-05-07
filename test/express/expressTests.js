var assert = require('chai').assert;
var rsvp = require('rsvp');
var _ = require('lodash');
var path = require('path');

var httpMocks = require('node-mocks-http');
var request = require('supertest');

var Route = require('../../src/route').Route;
var expressMvc = require('../../src/express/index');
var Result = expressMvc.Result;
var next = function () {
};

suite('express tests', function () {

    function initUsers(users) {
        for (var i = 0; i < 3; i++) {
            users.push({id: i, name: 'User #' + (i + 1)});
        }
        return users;
    }

    function getUsers() {
        return this.users;
    }

    function getUser(id) {
        throwIfInvalidUserId(id);

        return this.users[id];
    }

    function createUser(data) {
        var id = this.users.length;
        var newUser = {
            id: id,
            name: data.name
        };
        this.users.push(newUser);
        return newUser;
    }

    function deleteUser(id) {
        throwIfInvalidUserId(id);

        if (id < this.users.length) {
            this.users = this.users.splice(id, 1);
        }

        return Result.OK;
    }

    function updateUser(id, data) {
        throwIfInvalidUserId(id);

        this.users[id] = _.extend(this.users[id], data);

        return Result.Success;
    }

    function throwIfInvalidUserId(id) {
        if (id < 0 && this.users.length >= id) {
            throw {message: 'Invalid user id'};
        }
    }

    function pageNotFound(req, res, next) {
        res.status(404).end();
    }

    var app;
    var UsersController;

    setup(function () {
        var bodyParser = require('body-parser');

        app = require('express')();
        app.use(bodyParser.json()); //app.use(bodyParser.data());
        app.use(bodyParser.urlencoded());

        /**
         * @class UsersController
         * @constructor
         */
        UsersController = Route('/api/users')(function () {
            this.users = initUsers([]);
        });
    });

    test('get user by id', function (done) {
        UsersController.prototype.get = getUser;

        expressMvc.bindController(app, UsersController);

        request(app)
            .get('/api/users/1')
            .expect({id: 1, name: 'User #2'})
            .expect(200, done);
    });

    test('get users', function (done) {
        UsersController.prototype.list = getUsers;

        expressMvc.bindController(app, UsersController);

        request(app)
            .get('/api/users')
            .expect([{id: 0, name: 'User #1'}, {id: 1, name: 'User #2'}, {id: 2, name: 'User #3'}])
            .expect(200, done);
    });

    test('create user', function (done) {
        UsersController.prototype.create = createUser;

        expressMvc.bindController(app, UsersController);

        app.use(pageNotFound);

        request(app)
            .post('/api/users')
            .send({name: 'Pencho'})
            .expect(200)
            .expect({id: 3, name: 'Pencho'})
            .end(done);
    });

    test('delete user', function (done) {
        UsersController.prototype.list = getUsers;
        UsersController.prototype.delete = deleteUser;

        var users = initUsers([]);

        expressMvc.bindController(app, UsersController, function (ctor) {
            return Object.create(ctor, {
                users: {value: users}
            });
        });

        app.use(pageNotFound);

        request(app)
            .delete('/api/users/1')
            .expect(200, function (err, req) {
                if (err) done(err);

                request(app)
                    .get('/api/users')
                    .expect(200)
                    .expect([{id: 0, name: 'User #1'}, {id: 2, name: 'User #3'}])
                    .end(done);
            });
    });

    test('update user', function (done) {


        UsersController.prototype.get = getUser;
        UsersController.prototype.update = updateUser;

        var users = initUsers([]);

        expressMvc.bindController(app, UsersController, function (ctor) {
            return Object.create(ctor, {
                users: {value: users}
            });
        });

        app.use(pageNotFound);

        request(app)
            .put('/api/users/1')
            .send({name: 'John Doe'})
            .expect(200)
            .end(function (err, res) {
                if (err) done(err);

                request(app)
                    .get('/api/users/1')
                    .expect(200)
                    .expect({id: 1, name: 'John Doe'})
                    .end(done);
            });
    });

    test('init controllers from dir', function (done) {
        var options = {
            controllerDir: path.resolve(__dirname, '../controllers')
        };

        app.use(expressMvc.middleware(options));

        request(app)
            .get('/api/users')
            .expect(200)
            .expect(['user1', 'user2'])
            .end(done)
        ;
    });

});
