var Observable = require("FuseJS/Observable");
var API = require("Assets/JS/API.js");
var Event = require('FuseJS/UserEvents');
var Storage = require("FuseJS/Storage");

var CONFIG_FILENAME = "config.json";
var user = Observable();

function RemoveUser()
{
	user.clear();
	API.Logout();
	Storage.deleteSync(CONFIG_FILENAME);
}

// Try loading saved user data
try
{
	var _user = JSON.parse(Storage.readSync(CONFIG_FILENAME));
	user.value = _user[0];
	API.access_token = _user[1];
	API.access_token_secret = _user[2];
} catch(err)
{
	RemoveUser();
}

module.exports = {
	user: user,
	Login: function(_user)
	{
		_user.screenname = "@" + _user.username;
		_user.https_domain = "https://" + _user.domain;
		Storage.writeSync(CONFIG_FILENAME, JSON.stringify([_user, API.access_token, API.access_token_secret]));
		user.value = _user;
		Event.raise("Info", {message: "Welcome, " + _user.username + "!"});
	},
	Logout: function()
	{
		RemoveUser();
		Event.raise("Info", {message: "Logged out"});
	},
};