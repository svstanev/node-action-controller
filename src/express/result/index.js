var Result = require('./result');
var ErrorResult = require('./errorResult');
var VoidResult = require('./voidResult');

var utils = require('../../utils');

var success = new Result(200);

module.exports = utils.extend(Result, {
    Error:          ErrorResult,
    InternalError:  require('./internalErrorResult'),
    View:           require('./viewResult'),
    Json:           require('./jsonResult'),
    Redirect:       require('./redirectResult'),
    Continue:       require('./continueResult'),
    //Void:           require('./voidResult'),

    OK:         success,
    Ok:         success,
    Success:    success,

    BadRequest:             new ErrorResult(400),
    Unauthorized:           new ErrorResult(401),
    Forbidden:              new ErrorResult(403),
    NotFound:               new ErrorResult(404),

    InternalServerError:    new ErrorResult(500),

    toResult: function resultFactory(o) {
        if (utils.isUndefined(o)) {
            return new VoidResult();
        }

        if (o === null) {
            return new ErrorResult(404);
        }

        if (utils.isNumber(o)) {
            return new Result(o);
        }

        return new Result(200, o);
    }
});