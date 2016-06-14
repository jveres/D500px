var Observable = require("FuseJS/Observable");
var Helpers = require("Assets/JS/Helpers.js");
var API = require("Assets/JS/API.js");
var Event = require('FuseJS/UserEvents');

var user = Observable();
var screen = Observable();

this.onParameterChanged(function(param)
{
    user.value = param;
    screen.value = {
    	username: "@" + param.username,
    	fullname: "(" + param.fullname + ")",
    	domain: "https://" + param.domain
    };
});

function GoBack()
{
	router.goBack();
}

function SignOut()
{
	Event.raise("Logout");
	GoBack();
}

module.exports={
	GoBack: GoBack,
	SignOut: SignOut,
	user: user,
	screen: screen
};