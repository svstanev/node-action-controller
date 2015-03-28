# Action controller for Node.js and Express web framework

## Getting started

Conventions over configuration

## Structure

    App/
        controllers/
            api/
                accountController.js    --> /api/account

## Controllers



### Naming conventions

### Examples

    var mvc = require('mvc');

    function AccountController() {
    }

    AccountController.prototype.get = function() {
    };

    AccountController.prototype.create = function() {
    };

    AccountController.prototype.update = function() {
    };

    AccountController.prototype.delete = function() {
    };

    module.exports = AccountController;

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
    var mvc = require('mvc');

    app.use(mvc.express({
        controllerDir: path.join(__dirname, 'controllers'),
        factory: function (controller, context) {

        }
    }));

### express.Result