var assert = require('assert');
var utils = require('../../utils');
var ErrorResult = require('./errorResult')

/**
 * InternalErrorResult
 * @param error
 * @constructor
 */
function InternalErrorResult(error) {
    if (!(this instanceof InternalErrorResult)) {
        return new InternalErrorResult(error);
    }

    ErrorResult.call(this, 500, error);
}

utils.inherits(InternalErrorResult, ErrorResult);

module.exports = InternalErrorResult;