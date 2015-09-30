var assert = require('assert');
var utils = require('../../utils');
var Result = require('./result');

/**
 * Do nothing result
 * @constructor
 */
function VoidResult() {
    if (!(this instanceof VoidResult)) {
        return new VoidResult();
    }
}

VoidResult.prototype.render = function () {
};

module.exports = VoidResult;