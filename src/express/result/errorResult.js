var assert = require('assert');
var utils = require('../../utils');
var Result = require('./result');

/**
 * ErrorResult
 * @param code
 * @param error
 * @constructor
 */
function ErrorResult(code, error) {
    if (!(this instanceof ErrorResult)) {
        return new ErrorResult(code, error);
    }
    Result.call(this, code);

    this.error = error;
}

utils.inherits(ErrorResult, Result);

ErrorResult.prototype.renderOverride = function (res) {
    // do not call res.end() as the res.send() will call it anyways
    res.send(this.error);
};

module.exports = ErrorResult;