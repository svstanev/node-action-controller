var utils = require('../../utils');
var assert = require('assert');

/**
 * Result
 * @param code
 * @constructor
 */
function Result(code, data) {
    if (!(this instanceof Result)) {
        return new Result(code, data);
    }

    //assert(['string', 'object'].indexOf(typeof data) != -1, '');

    this.noCache = true;
    this.code = code;

    switch (typeof data) {
        case 'function':
            assert(false, 'Unsupported result body type: Function');
            break;

        case 'number':
            // express' response.send always treats numbers as statusCode so we have to encode 'em as strings
            data = '' + data;
            break;
    }

    this.data = data;
}

Result.prototype.render = function (res) {
    if (this.noCache) {
        var setHeader = res.header || res.setHeader;

        setHeader.call(res, "Cache-Control", "no-cache, no-store, must-revalidate");
        setHeader.call(res, "Pragma", "no-cache");
        setHeader.call(res, "Expires", 0);
    }

    if (this.code) {
        res.status(this.code);
    }

    if (this.renderOverride) {
        this.renderOverride(res);
    }
};

Result.prototype.renderOverride = function (res) {
    res.send(this.code, this.data);
};

module.exports = Result;
