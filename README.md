# Action controller for Node.js and Express web framework

## Getting started

Conventions over configuration

## Structure

    App/
        controllers/
            api/
                accountsController.js    --> /api/accounts

## Controllers



### Naming conventions

### Examples

    var mvc = require('node-action-controller');

    function AccountsController() {
    }

    // GET /api/accounts
    AccountsController.prototype.list = function() {
    };

    // GET /api/accounts/:id
    AccountsController.prototype.get = function(id) {
    };

    // alias for AccountsController.get
    AccountsController.prototype.index = function(id) {
    };

    // POST /api/accounts data
    AccountsController.prototype.post = function(data) {
    };

    // alias for AccountsController.post
    AccountsController.prototype.create = function(data) {
    };

    // PUT /api/accounts/:id data
    AccountsController.prototype.put = function(id, data) {
    };

    // alias for AccountsController.put
    AccountsController.prototype.update = function(id, data) {
    };

    // DELETE /api/accounts/:id
    AccountsController.prototype.delete = function(id) {
    };

    // alias for AccountsController.delete
    AccountsController.prototype.destroy = function(id) {
    };

    module.exports = AccountsController;

## API

### Route

#### Route(path, options, fn)

##### Parameters

* **path** - base path for the controller's actions
* **options**
    * path -
    * args -
    * before -
    * after -
* **fn** - the controller constructor function

##### Returns
The controller constructor function *fn*


#### Route.http(path, options, fn)

#### Route.httpGet(path, options, fn)

#### Route.httpPost(path, options, fn)

#### Route.httpPut(path, options, fn)

#### Route.httpDelete(path, options, fn)

### express(options)

#### Parameters

* **options**
    *   **controllerDir** - the path to the directory that contains the controller definitions, usually ```./controllers```
    *   **factory** - a function that is used to create the controller objects when needed.

    Parameters:

    controller - the controller constructor function

    context

    [request](http://expressjs.com/4x/api.html#request)

    [response](http://expressjs.com/4x/api.html#response)

#### Returns
[Express.Router](http://expressjs.com/4x/api.html#router) object

#### Remarks

#### Example
    var mvc = require('node-action-controller');

    app.use(mvc.express({
        controllerDir: path.join(__dirname, 'controllers'),
        factory: function (controller, context) {

        }
    }));

### express.Result