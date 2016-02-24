var xauth = require("XAuth");

var BASE_URL = "https://500px.com";
var API_URL = "https://api.500px.com/v1";
var RPP = 40;

function formDecode(o)
{
    var data = {};
    if (o && typeof o === "string")
	    o.trim().split('&').forEach(function(b)
	    {
	    	if (b)
			{
				var split = b.split('=')
				var name = split.shift().replace(/\+/g, ' ')
				var value = split.join('=').replace(/\+/g, ' ')
				data[decodeURIComponent(name)] = decodeURIComponent(value);
			}
	    });
    return data;
}

function PhotoStream(endpoint, opts)
{
	if (!opts) opts = {};
	this.method = "GET";
	this.url = API_URL + endpoint;
	this.data = opts;
	this.data.formats = "jpeg";
	this.data.image_size = "30,1080";
	this.data.rpp = RPP;
	this.current_page = 1;
	this.total_pages = 1;

	this.Load = function(opts)
	{
		var self = this;
		if (!opts) opts = {};
		if (!opts.page) opts.page = 1;
		var data = self.data;
		data.page = opts.page;
		return xauth.xauth_request({method: self.method, url: self.url, data: data})
		.then(function(result)
		{
			if (result.status === 200)
			{
				var response = JSON.parse(result.responseText);
				self.current_page = parseInt(response.current_page) || 1;
				self.total_pages = parseInt(response.total_pages) || 1;
				return Promise.resolve(response);
			}
			else throw new Error("Server Error: " + result.statusText + " (" + result.status + ")");
		});
	};

	this.More = function()
	{
		return this.Load({page: Math.min(this.current_page + 1, this.total_pages)});
	};
}

function API()
{
	this.BASE_URL = BASE_URL;

	this.Login = function(username, password)
	{
		var self = this;
    	var fetch_request_token = xauth.xauth_request(
    	{
	        method: "POST",
	        url: API_URL + "/oauth/request_token",
	        username: username,
	        password: password
	    });
	    var fetch_access_token = fetch_request_token.then(function(response)
	    {
	        var data = formDecode(response.responseText);
	        return xauth.xauth_request(
	        {
	            method: "POST",
	            url: API_URL + "/oauth/access_token",
	            token: data.oauth_token,
	            token_secret: data.oauth_token_secret,
	            username: username,
	            password: password
	        })
	        .then(function(response)
	        {
	        	var data = formDecode(response.responseText);
	        	self.access_token = data.oauth_token;
    			self.access_token_secret = data.oauth_token_secret;
    			if (!self.access_token || !self.access_token_secret) throw new Error(response.statusText);
    			return response;
	        });
	    });
	    return Promise.all([fetch_request_token, fetch_access_token]);
	};

	this.Logout = function()
	{
		return new Promise(function(resolve)
		{
			if (this.access_token) delete this.access_token;
			if (this.access_token_secret) delete this.access_token_secret;
			resolve();
		});
	};

	this.SetPhotoStream = function(endpoint, opts)
	{
		this.PhotoStream = new PhotoStream(endpoint, opts);
	};

	this.SetSearchText = function(term)
	{
		if (term.trim() === "") this.PhotoStream = Promise.resolve({photos: []});
		this.PhotoStream = new PhotoStream("/photos/search", {term: term || ""});
	}
}

module.exports = new API();
