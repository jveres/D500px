var xauth = require("XAuth");

var BASE_URL = "https://500px.com";
var API_URL = "https://api.500px.com/v1";
var RPP = 40;

Response.prototype.data = function()
{
    var data = {};
    if (!this._bodyText || typeof this._bodyText !== "string") return;
    this._bodyText.trim().split('&').forEach(function(bytes)
    {
    	if (bytes)
		{
			var split = bytes.split('=')
			var name = split.shift().replace(/\+/g, ' ')
			var value = split.join('=').replace(/\+/g, ' ')
			data[decodeURIComponent(name)] = decodeURIComponent(value);
		}
    })
    return data;
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
	        var data = response.data();
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
	        	self.access_token = response[1].data().oauth_token;
    			self.access_token_secret = response[1].data().oauth_token_secret;
    			if (!self.access_token || !self.access_token_secret) throw new Error(response.statusText);
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

	this.LoadFeature = function(feature)
	{
		if (!feature) feature = "popular";
		return xauth.xauth_request(
		{
        	method: "GET",
        	url: API_URL + "/photos",
        	data:
        	{
            	feature: feature,
            	image_size: "30,1080",
            	rpp: RPP
        	}
    	})
    	.then(function(result)
    	{
    		if (result.status === 200) return result.json();
    		else throw new Error("Server Error: " + result.statusText + " (" + status + ")");
    	});
	}
}

module.exports = new API();
