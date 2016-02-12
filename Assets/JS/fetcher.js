var DEFAULT_TIMEOUT = 10000;

function fetcher(url, options)
{
  if (!options) options = {};
  return new Promise(function(resolve, reject) {
    var isTimedout = false;
    var timeout = setTimeout(function() {
      isTimedout = true;
      reject(new Error('Request timed out'));
    }, options.timeout || DEFAULT_TIMEOUT);
    fetch(url, options)
    .then(function(response) {
      clearTimeout(timeout);
      if (isTimedout) return reject(new Error('Request timed out'));
      if (response) resolve(response);
      else reject(new Error('No response from server'));
    })
    .catch(function(err) {
      reject(err);
    });
  });
}

module.exports =
{
  fetch: fetcher
};