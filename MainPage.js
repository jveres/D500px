var Observable = require("FuseJS/Observable");
var Event = require('FuseJS/UserEvents');

var TOAST_DISMISS_TIMEOUT = 5*1000;
var toastText = Observable("");
var toastColor = Observable("#444");

// Display toast message
var _toastTimer = undefined;
function OnError(args)
{
	clearTimeout(_toastTimer);
	toastColor.value = "#b31b00";
	toastText.value = args.message;
	_toastTimer = setTimeout(function() { 
		toastText.value = "";
	}, TOAST_DISMISS_TIMEOUT);
}

function OnInfo(args)
{
	clearTimeout(_toastTimer);
	toastColor.value = "#444";
	toastText.value = args.message;
	_toastTimer = setTimeout(function() { 
		toastText.value = "";
	}, TOAST_DISMISS_TIMEOUT);
}

module.exports =
{
	toastText: toastText,
	toastColor: toastColor,
	OnError: OnError,
	OnInfo: OnInfo
};
