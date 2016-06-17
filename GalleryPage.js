var Observable = require("FuseJS/Observable");
var Helpers = require("Assets/JS/Helpers.js");
var HTML = require("Assets/JS/Html.js");
var API = require("Assets/JS/API.js");
var Event = require('FuseJS/UserEvents');
var Storage = require("FuseJS/Storage");

var CONFIG_FILENAME = "config.json";

var feed = Observable();

var features = Observable();
var currentFeature = Observable();
var IsReloading = Observable(false);
var IsLoadingMore = Observable(false);
var LoadingState = Observable("Loading");
var searchText = Observable("");
var user = Observable();
var screen = Observable();

var _loader = undefined;

function Feature(title, desc, feature)
{
	this.title = title;
	this.desc = desc;
	this.endpoint = "/photos";
	this.opts = {feature: feature};
	var self = this;
	this.isSelected = Observable(function() {
		return self === currentFeature.value;
	});
	this.select = function()
	{
		if (self !== currentFeature.value)
		{
			currentFeature.value = self;
			API.SetPhotoStream(self.endpoint, self.opts);
			LoadFeed({clear: true});
		}
	};
};

function SearchFeature(text)
{
	this.title = text;
	this.desc = "Searching photos";
	this.isSelected = Observable(false);
	var self = this;
	this.select = function()
	{
		currentFeature.value = self;
		API.SetSearchText(text);
		LoadFeed({clear: true});
	};
};

function Photo(url, image_aspect, image_url, photo_url, name, avatar_url, username, votes_count)
{
	this.url = API.BASE_URL + url;
	this.image_url = image_url;
	this.image_aspect = image_aspect;
	this.photo_url = photo_url;
	this.name = HTML.unescape(name);
	this.avatar_url = avatar_url;
	this.username = "@" + username;
	this.user_url = API.BASE_URL + "/" + username;
	this.votes_count = votes_count;
}

function hasImage(image_url)
{
	for (var i=0; i<feed.length; i++) if (feed.getAt(i).image_url === image_url) return true;
	return false;
}

function processResponse(response)
{
	var result = [];
	for (var i=0; i<response.photos.length; i++)
	{
		var responsePhoto = response.photos[i];
		var image_url, photo_url;
    	for (var j=0; j<responsePhoto.images.length; j++)
    	{
    		if (responsePhoto.images[j].size === 30) image_url = responsePhoto.images[j].https_url;
    		else if (responsePhoto.images[j].size === 1080) photo_url = responsePhoto.images[j].https_url;
    	}
    	if (!hasImage(image_url))
	    	result.push(new Photo(
	    		responsePhoto.url,
				responsePhoto.width / responsePhoto.height,
				image_url,
				photo_url,
				responsePhoto.name,
				responsePhoto.user.avatars.default.https,
				responsePhoto.user.username,
				responsePhoto.votes_count)
	    	);
	}
	return result;
}

function LoadFeed(opts)
{
	if (!opts) opts = {clear: false, more: false};
	if (_loader) _loader.cancel();

	LoadingState.value = "Loading";

	if (opts.clear) {
		feed.replaceAll([]);
		IsReloading.value = false;
		IsLoadingMore.value = false;
	}
	
	_loader = Helpers.Promise(function(resolve, reject)
	{
		var _stream = opts.more ? API.PhotoStream.More() : API.PhotoStream.Load();
		_stream.then(function(response)
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
		var items = processResponse(result);
		if (items.length > 0) {
			for (var i=0; i<items.length; i++) (opts.more ? feed.add(items[i]) : feed.insertAt(i, items[i]));
			LoadingState.value = "Ready";
		}
		else if (feed.length === 0) LoadingState.value = "NotFound";
		IsReloading.value = false;
		IsLoadingMore.value = false;
	})
	.catch(function(err)
	{
		if (!(err instanceof Helpers.CancellationError))
		{
			debug_log(err);
			if (feed.length === 0) LoadingState.value = "TryAgain";
			Event.raise("Error", {message: err.message || err});
		}
		IsReloading.value = false;
		IsLoadingMore.value = false;
	});
}

function Reload()
{
	IsReloading.value = true;
	LoadFeed();
}

function LoadMore()
{
	IsLoadingMore.value = true;
	LoadFeed({more: true});
}

function ScrollToTop()
{
	scrollView.goto(0, 0);
}

function Search()
{
	var text = searchText.value;
	if (text.trim() !== "")
		new SearchFeature('"' + text + '"').select();	
}

function Login()
{
	router.push("login");
}

function Logout()
{
	router.push("logout", user.value);
}

function SetupUser(data)
{
	user.value = data;
	screen.value = {username: "@" + data.username};
}

function DeleteUser()
{
	user.clear();
	screen.clear();
	API.Logout();
	Storage.deleteSync(CONFIG_FILENAME);
}

function OnLogin(args)
{
	var config = {
		user: args.user,
		access_token: API.access_token,
		access_token_secret: API.access_token_secret
	};
	SetupUser(config.user);
	Storage.writeSync(CONFIG_FILENAME, JSON.stringify(config));
	Event.raise("Info", {message: "Welcome, " + config.user.username + "!"});
}

function OnLogout(args)
{
	DeleteUser();
	Event.raise("Info", {message: "Logged out"});
}

function init()
{
	var config = Storage.readSync(CONFIG_FILENAME);
	try
	{
		config = JSON.parse(config);
		API.access_token = config.access_token;
		API.access_token_secret = config.access_token_secret;
		SetupUser(config.user);
	} catch(err)
	{
		DeleteUser();
	}
	features.add(new Feature("Most Popular", "Trending Right Now", "popular"));
	features.add(new Feature("Highest Rated", "Photos that Have Been Popular", "highest_rated"));
	features.add(new Feature("Editor's Choice", "Picked by Top Photographers", "editors"));
	features.add(new Feature("Upcoming", "Promising New Uploads", "upcoming"));
	features.add(new Feature("Fresh Today", "Latest from the Community", "fresh_today"));

	features.getAt(0).select();
	LoadFeed({clear: true});
}

init();

module.exports =
{
	feed: feed,
	features: features,
	currentFeature: currentFeature,
	IsReloading: IsReloading,
	Reload: Reload,
	LoadFeed: LoadFeed,
	IsLoadingMore: IsLoadingMore,
	LoadMore: LoadMore,
	LoadingState: LoadingState,
	ScrollToTop: ScrollToTop,
	searchText: searchText,
	Search: Search,
	Login: Login,
	Logout: Logout,
	OnLogin,
	OnLogout,
	user: user,
	screen: screen
};
