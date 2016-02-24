var helpers = require("Helpers");

var DEFAULT_TIMEOUT = 10000;

function fetch(url, opts)
{
  if (!opts) opts = {};
  if (!opts.method) opts.method = "GET";
  if (!opts.timeout) opts.timeout = DEFAULT_TIMEOUT;
  return helpers.Promise(function(resolve, reject)
  {
    var request = new HttpClient().createRequest(opts.method, url);
    request.onerror = function(err)
    {
      reject(err);
    };
    request.ondone = function()
    {
      var response = {
        status: request.getResponseStatus(),
        statusText: request.getResponseReasonPhrase(),
        responseText: request.getResponseContentString()
      };
      resolve(response);
    };
    for (var k in opts.headers) request.setHeader(k, opts.headers[k] + "");
    request.sendAsync(opts.body);
  })
  .timeout(DEFAULT_TIMEOUT, "Request timed out");
}

module.exports =
{
  fetch: fetch
};
