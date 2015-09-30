var assert = require('assert');
var utils = require('../../utils');
var Result = require('./result');

/**
 * RedirectResult
 * @constructor
 */
function RedirectResult(code, url) {
    if (!(this instanceof RedirectResult)) {
        return new RedirectResult(code, url);
    }

    Result.call(this);

    this.url = url || code;
    this.code = url ? code : 302;
}

utils.inherits(RedirectResult, Result);

RedirectResult.prototype.render = function (res) {
    res.redirect(this.code, this.url);
};

module.exports = RedirectResult;