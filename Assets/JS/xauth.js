var sha1 = require("Sha1");
var fetcher = require("Fetcher");

var OAUTH_CONSUMER_KEY = "G7ZWcGQU5W395mCb0xx3dccp6x0fvQB8G8JCSaDg";
var OAUTH_CONSUMER_SECRET = "f28ggAXsPKBAZpEQHgXYSNBYXdeEZJgUla44pJEk";
var OAUTH_VERSION = "1.0";
var OAUTH_SIGNATURE_METHOD = "HMAC-SHA1";
var XAUTH_MODE = "client_auth";

function xauth_request(opts)
{
    if (!opts) opts = {};
    if (!opts.method) opts.method = "POST";
    if (!opts.url) opts.url = "";
    if (!opts.token_secret) opts.token_secret = "";
    
	function timestamp()
	{
        var t = (new Date()).getTime();
        return Math.floor(t / 1000);
    }

    function nonce(length)
    {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        var result = "";
        for (var i = 0; i < length; ++i)
        {
            var rnum = Math.floor(Math.random() * chars.length);
            result += chars.substring(rnum, rnum+1);
        }
        return result;
    }

    function percentEncode(s) {
        if (s == null) {
            return "";
        }
        if (s instanceof Object) {
			var e = "";
            for (var i in s)
            {
            	if (s.hasOwnProperty(i))
            	{
                	if (e != "") e += '&';
                	e += percentEncode(s[i]);
            	}
            }
            return e;
        }
        s = encodeURIComponent(s);
        s = s.replace(/\!/g, "%21");
        s = s.replace(/\*/g, "%2A");
        s = s.replace(/\'/g, "%27");
        s = s.replace(/\(/g, "%28");
        s = s.replace(/\)/g, "%29");
        return s;
    }

    function formEncode(o)
    {
    	var sortable = [];
    	for (var i in o) if (o.hasOwnProperty(i)) sortable.push([percentEncode(i)+" "+percentEncode(o[i]),[i, o[i]]]);
        sortable.sort(
            function(a,b)
        	{
        		if (a[0] < b[0]) return -1;
                if (a[0] > b[0]) return  1;
                return 0;
            }
        );
        var e = "";
        for (var s = 0; s < sortable.length; ++s) {
        	if (e != "") e += '&';
            e += percentEncode(sortable[s][1][0])+'='+percentEncode(sortable[s][1][1]);
        }
        return e;
    }

    function addUrlParams(url, params) {
        newUrl = url;
        var toAdd = formEncode(params);
        if (toAdd.length > 0)
        {
            var q = url.indexOf('?');
            if (q < 0) newUrl += '?';
            else newUrl += '&';
            newUrl += toAdd;
        }
        return newUrl;
    }

	var params = {
		oauth_consumer_key: OAUTH_CONSUMER_KEY,
		oauth_nonce: nonce(6),
    	oauth_signature_method: OAUTH_SIGNATURE_METHOD,
    	oauth_timestamp: timestamp(),
    	oauth_version: OAUTH_VERSION
	};

    var headers = {
        "Accept-Encoding": "none",
        "Accept-Language": "en",
        "Accept-Charset": "UTF-8",
        "Cookie": ""
    };

    if (opts.token) params.oauth_token = opts.token;
    if (opts.username && opts.password)
    {
        params.x_auth_username = opts.username;
        params.x_auth_password = opts.password;
        params.x_auth_mode = XAUTH_MODE;
        opts.data = 'x_auth_username=' + params.x_auth_username + '&x_auth_password=' + params.x_auth_password + '&x_auth_mode=' + XAUTH_MODE;
    }

    if (typeof opts.data === "object")
    {
        if (opts.method === "GET")
        {
            for (var d in opts.data) if (opts.data.hasOwnProperty(d)) params[d] = opts.data[d];
            opts.data = "";
        }
        else if (opts.method === "POST") opts.data = formEncode(opts.data);
    }
    else throw new Error("Invalid type of \'opts.data\' (expected \'Object\')");

    var oauth_base = opts.method+'&'+ percentEncode(opts.url)+'&'+ percentEncode(formEncode(params));
    var signing_key = OAUTH_CONSUMER_SECRET+'&'+opts.token_secret;
    var oauth_signature = sha1.b64_hmac_sha1(signing_key, oauth_base);
    
    if (opts.username && opts.password)
    {
        var oauth_header = 'OAuth oauth_nonce="' + params.oauth_nonce
            + '"' + ', oauth_signature_method="' + OAUTH_SIGNATURE_METHOD + '"' 
            + ', oauth_timestamp="' + params.oauth_timestamp + '"' 
            + ', oauth_consumer_key="' + OAUTH_CONSUMER_KEY + '"' 
            + ', oauth_signature="' + encodeURIComponent(oauth_signature) + '"'
            + (params.oauth_token ? ', oauth_token="' + encodeURIComponent(params.oauth_token) + '"' : '')
            + ', oauth_version="' + OAUTH_VERSION + '"';
        headers["Authorization"] = oauth_header;
    }

    if (opts.method === "GET")
    {
        params.oauth_signature = oauth_signature;
        opts.url = addUrlParams(opts.url, params);
    }
    else if (opts.method === "POST")
    {
        headers["Content-Type"]  = "application/x-www-form-urlencoded";
    }

    var req = {
        method: opts.method,
        headers: headers
    };
    if (opts.data) req.body = opts.data;

    return fetcher.fetch(opts.url, req);
}

module.exports =
{
    xauth_request: xauth_request
};
