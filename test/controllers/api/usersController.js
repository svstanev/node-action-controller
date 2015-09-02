var Route = require('../../../index').Route;

function UsersController() {
}

UsersController.prototype.myProperty = 'abc';

UsersController.prototype.dispose = function () {

};

UsersController.prototype.someAction = function () {

};

UsersController.prototype.notAnAction = Route.httpIgnore()(function () {

});

UsersController.prototype._notAnAction = function () {

};

UsersController.prototype.__notAnAction = function () {

};

UsersController.prototype.list = function () {
    return ['user1', 'user2'];
};

UsersController.prototype.get = function (id) {
    return id;
};

UsersController.prototype.getProject = Route.httpGet('/projects/:id')(function (id) {
    return id;
});

UsersController.prototype.newProject = Route.httpGet('/projects/new')(function (id) {
    return id;
});

UsersController.prototype.getReport = Route.httpGet('/projects/:projectId/reports/:id')(function (id) {
    return id;
});

UsersController.prototype.newReport = Route.httpGet('/projects/:projectId/reports/new')(function (id) {
    return id;
});

module.exports = UsersController;
