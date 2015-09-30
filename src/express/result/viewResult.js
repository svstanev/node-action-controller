var assert = require('assert');
var utils = require('../../utils');
var Result = require('./result');

/**
 * ViewResult
 * @param view
 * @param model
 * @constructor
 */
function ViewResult(view, model) {
    if (!(this instanceof ViewResult)) {
        return new ViewResult(view, model);
    }
    Result.call(this, 200);

    this.view = view;
    this.model = model;
}
utils.inherits(ViewResult, Result);

ViewResult.prototype.renderOverride = function (res) {
    res.render(this.view, this.model);
};

module.exports = ViewResult;