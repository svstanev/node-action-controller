var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

/**
 * (Borrowed from AngularJS)
 * @param fn {Function}
 * @return {Array}
 */
module.exports.getArgNames = function getArgNames(fn) {
    var fnText = fn.toString().replace(STRIP_COMMENTS, '');
    var argDecl = fnText.match(FN_ARGS);
    var args = [];
    argDecl[1].split(FN_ARG_SPLIT).forEach(function (arg) {
        arg.replace(FN_ARG, function (all, underscore, name) {
            args.push(name);
        });
    });
    return args;
};


function getType(o) {
    if (Array.isArray(o)) {
        return 'array';
    }
    return typeof(o);
}

module.exports.withOverloads = function withOverloads(overloads) {
    return function () {
        var self = this;
        var args = Array.prototype.slice.call(arguments);
        var argTypes = args.map(getType);

        var argCount = argTypes.length, fn;

        overloads.some(function (overload) {
            if (overload.length === argCount + 1) {
                var match = true;
                for (var i = 0; match && i < argCount; i++) {
                    match = overload[i] === argTypes[i];
                }

                if (match) {
                    fn = overload[overload.length - 1];
                }
            }

            return fn;
        });

        if (fn) {
            return fn.apply(self, arguments);
        }

        throw new Error('cannot invoke function with arguments [' + argTypes.join(', ') + ']');
    };
}