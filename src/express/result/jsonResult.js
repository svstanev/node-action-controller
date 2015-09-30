var assert = require('assert');
var utils = require('../../utils');
var Result = require('./result');

/**
 * JsonResult
 * @constructor
 */
function JsonResult(data) {
    if (!(this instanceof JsonResult)) {
        return new JsonResult(data);
    }
    Result.call(this, 200);

    this.data = data;
}
utils.inherits(JsonResult, Result);

JsonResult.prototype.renderOverride = function (res) {
    res.json(this.data);
    res.end();
};

module.exports = JsonResult;