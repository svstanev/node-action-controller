var assert = require('assert');
var utils = require('../../utils');
var Result = require('./result');

/**
 * ContinueResult
 * @return {ContinueResult}
 * @constructor
 */
function ContinueResult(err) {
    if (!(this instanceof ContinueResult)) {
        return new ContinueResult(err);
    }

    this.err = err;
}

ContinueResult.prototype.render = function (res, next) {
    var args = [];
    if (this.err) {
        args.push(this.err);
    }

    next.apply(null, args);
};

module.exports = ContinueResult;