var Observable = require("FuseJS/Observable");
var Helpers = require("Assets/JS/Helpers.js");
var API = require("Assets/JS/API.js");
var Event = require('FuseJS/UserEvents');

var IsSigningIn = Observable(false);
var username = Observable("");
var password = Observable("");

var _loader = undefined;

var IsReadyToSignIn = Observable(function() {
	return (username.value.trim() !== "" && password.value.trim() !== "");
});

function GoBack()
{
	if (_loader) _loader.cancel();
	router.goBack();
}

function SignIn()
{
	IsSigningIn.value = true;
	if (_loader) _loader.cancel();
	_loader = Helpers.Promise(function(resolve, reject)
	{
		var _login = API.Login(username.value, password.value);
		_login.then(function(response)
		{
			resolve(response);
		})
		.catch(function(err)
		{
			reject(err);
		});
	});
	
	_loader.then(function(result)
	{
		// Login sccessfull
		IsSigningIn.value = false;
		var user = result[2].user;
		Event.raise("Login", {user: user});
		GoBack();
	})
	.catch(function(err)
	{
		// Login error
		if (!(err instanceof Helpers.CancellationError))
		{
			Event.raise("Error", {message: err.message || err});
		}
		IsSigningIn.value = false;
	});
}

module.exports={
	GoBack: GoBack,
	SignIn: SignIn,
	IsSigningIn: IsSigningIn,
	IsReadyToSignIn: IsReadyToSignIn,
	username: username,
	password: password
};