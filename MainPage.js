var Observable = require("FuseJS/Observable");

var TOAST_DISMISS_TIMEOUT = 5*1000;
var DEFAULT_TOAST_COLOR = "#444";

var toastText = Observable("");
var toastColor = Observable(DEFAULT_TOAST_COLOR);

// Display toast message
var _toastTimer = undefined;

function DisplayToast(message, color)
{
	clearTimeout(_toastTimer);
	if (message)
	{
		toastColor.value = color || DEFAULT_TOAST_COLOR;
		toastText.value = message;
		_toastTimer = setTimeout(function() { 
			toastText.value = "";
		}, TOAST_DISMISS_TIMEOUT);
	}
}

function OnError(args)
{
	DisplayToast(args.message, "#b31b00");
}

function OnInfo(args)
{
	DisplayToast(args.message);
}

module.exports =
{
	toastText: toastText,
	toastColor: toastColor,
	OnError: OnError,
	OnInfo: OnInfo
};
