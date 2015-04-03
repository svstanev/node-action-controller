var ControllerLoader = require('./controllerLoader');
var comparer = require('./controllerComparer');

function initControllers(options, controllerBinder) {

    new ControllerLoader(options)
        .on('loaded', function (controllers) {
            // Order of controllers: from more specific path to more general -- desc order of the routes:
            //
            // /api/users/profile/basic
            // /api/users/profile
            // /api/users/:id -- params after the fixed path (above)
            // /api/users
            //
            controllers
                .sort(comparer.compareByPathDesc)
                .forEach(controllerBinder);
        })
        .beginLoad()
    ;

}

module.exports.initControllers = initControllers;
