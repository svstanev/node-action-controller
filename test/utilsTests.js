var assert = require('chai').assert;

var utils = require('../src/utils');

suite('utils', function() {
    suite('isPromise', function() {
        test('object is not a promise', function() {
            assert.isFalse(utils.isPromise({}));
        });

        test('null is not a promise', function() {
            assert.isFalse(utils.isPromise(null));
        });

        test('undefined is not a promise', function() {
            assert.isFalse(utils.isPromise(undefined));
        });

        test('es6 Promise is a promise', function() {
            assert.isTrue(utils.isPromise(Promise.resolve(123)));
        });

        test('object with methods then and catch is a promise', function() {
            var promise = {
                then: function() {},
                catch: function() {}
            };
            assert.isTrue(utils.isPromise(promise));
        });
    });
});