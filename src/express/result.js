var utils = require('../utils');
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

Result.prototype.render = function(res) {
    if (this.noCache) {
        var setHeader = res.header || res.setHeader;

        setHeader.call(res, "Cache-Control", "no-cache, no-store, must-revalidate");
        setHeader.call(res, "Pragma", "no-cache");
        setHeader.call(res, "Expires",0);
    }

    if (this.code) {
        res.status(this.code);
    }

    if (this.renderOverride) {
        this.renderOverride(res);
    }
};

Result.prototype.renderOverride = function(res) {
  res.send(this.code, this.data);
};

function isUndefined(o) {
  return typeof o === 'undefined';
}

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

ErrorResult.prototype.renderOverride = function(res) {
    // do not call res.end() as the res.send() will call it anyways
    res.send(this.error);
};

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

ViewResult.prototype.renderOverride = function(res) {

    // mockResponse render requires 3 arguments to catch the data correctly (2nd arg); passing null makes it work OK while
    // NOTE: res.render() calls res.end();
    res.render(this.view, this.model, null);
};



/**
 * JsonResult
 * @constructor
 */
function JsonResult(data){
    if (!(this instanceof JsonResult)) {
        return new JsonResult(data);
    }
    Result.call(this, 200);

    this.data = data;
}
utils.inherits(JsonResult, Result);

JsonResult.prototype.renderOverride = function(res) {
    res.json(this.data);
    res.end();
};



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

RedirectResult.prototype.render = function(res) {
    res.redirect(this.code, this.url);
};



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

ContinueResult.prototype.render = function(res, next) {
  var args = [];
  if (this.err) {
    args.push(this.err);
  }

  next.apply(null, args);
};

/**
 * Do nothing result
 * @constructor
 */
function VoidResult() {
  if (!(this instanceof VoidResult)) {
    return new VoidResult();
  }
}

VoidResult.prototype.render = function() { };


Result.Error = ErrorResult;
Result.InternalError = InternalErrorResult;
Result.View = ViewResult;
Result.Json = JsonResult;
Result.Redirect = RedirectResult;
Result.Continue = ContinueResult;
Result.Void = VoidResult;

// predefined results
Result.OK = Result.Ok = Result.Success = new Result(200);
Result.Created = new Result(201);
Result.Accepted = new Result(202);

Result.BadRequest = new ErrorResult(400);
Result.Unauthorized = new ErrorResult(401);
Result.Forbidden = new ErrorResult(403);
Result.NotFound = new ErrorResult(404);

Result.InternalServerError = new ErrorResult(500);

Result.toResult = function (o) {
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
};

module.exports = Result;
