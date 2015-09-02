var assert = require('chai').assert;
var controllerComparer = require('../src/controllerComparer');

function controller(path) {
    return {route: {path: path}};
}

function path(controller) {
    return controller.route.path;
}

suite('controller comparer', function () {
    test('empty paths are equal', function () {
        var c1 = controller('');
        var c2 = controller('');

        assert.strictEqual(0, controllerComparer.compareByPath(c1, c2));
    });

    test('root paths are equal', function () {
        var c1 = controller('/');
        var c2 = controller('/');

        assert.strictEqual(0, controllerComparer.compareByPath(c1, c2));
    });

    test('same length paths are equal', function () {
        var c1 = controller('/aaa');
        var c2 = controller('/bbb');

        assert.strictEqual(0, controllerComparer.compareByPath(c1, c2));
    });

    test('different length paths are equal', function () {
        var c1 = controller('/aaa/ccc');
        var c2 = controller('/bbb');

        assert.strictEqual(1, controllerComparer.compareByPath(c1, c2));
    });

    test('same length paths with params', function () {
        var c1 = controller('/aaa/ccc/:id');
        var c2 = controller('/aaa/ccc/xxx');

        assert.strictEqual(-1, controllerComparer.compareByPath(c1, c2));
    });

    test('sort array', function () {
        var arr = [
                controller('/aaa/ccc/:id'),
                controller('/aaa/ccc/xxx/:name'),
                controller('/aaa/ccc/xxx'),
            ]
                .sort(controllerComparer.compareByPathDesc)
            ;

        assert.sameMembers([
                '/aaa/ccc/xxx/:name',
                '/aaa/ccc/xxx',
                '/aaa/ccc/:id'],
            arr.map(path));
    });
});
