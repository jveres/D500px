
function CancellationError(message)
{
    this.name = "CancellationError";
    this.message = (message || "Promise cancelled");
}

CancellationError.prototype = Error.prototype;

function TimeoutError(message)
{
    this.name = "TimeoutError";
    this.message = (message || "Promise timeout");
}

CancellationError.prototype = Error.prototype;

function CancellablePromise(fn) {
  var _reject;
  var promise = new Promise(function(resolve, reject)
  {
    _reject = reject;
    fn(resolve, reject);
  });
  promise.isPending = function()
  {
    return !promise._state;
  };
  promise.cancel = function()
  {
    if (promise.isCancelled || !promise.isPending) return;
    _reject(new CancellationError());
    promise.isCancelled = true;
    return promise;
  }
  promise.timeout = function(ms, message)
  {
    promise._timeout = setTimeout(function()
    {
      if (promise.isPending()) _reject(new TimeoutError(message));
      clearTimeout(promise._timeout);
    }, ms);
    return promise;
  };
  return promise;
}

CancellablePromise.prototype = Promise.prototype;

module.exports =
{
  CancellationError: CancellationError,
  TimeoutError: TimeoutError,
  Promise: CancellablePromise
};
