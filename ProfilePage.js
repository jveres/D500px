var Observable = require("FuseJS/Observable");
var User = require('User.js');

function GoBack()
{
	router.goBack();
}

function SignOut()
{
	User.Logout();
	GoBack();
}

module.exports={
	GoBack: GoBack,
	SignOut: SignOut,
	user: User.user,
};