var Observable = require("FuseJS/Observable");
var event = require('FuseJS/UserEvents');
var helpers = require("Helpers");
var app = require("FuseJS/Lifecycle");
var html = require("Html");
var api = require("Api");

var ERROR_DISMISS_TIMEOUT = 3*1000;

var toast = Observable("");
var feed = Observable();

var searching = Observable(false);
var searchText = Observable("");

var LoadingState = {
	Loading: "loading",
	Ready: "ready"
};

var isReloading = Observable(false);
var loadingState = Observable(LoadingState.Ready);

var scrollToUrl = Observable("");
var reloadErrorSign = Observable("");

var selectedFeed = Observable();
var isFeedChanged = false;

var isSidebarEnabled = Observable(true);

var _errorTimeout;

function displayError(err)
{
	toast.value = (err.message || err);
	clearTimeout(_errorTimeout);
	_errorTimeout = setTimeout(function() { toast.value = ""; }, ERROR_DISMISS_TIMEOUT);
}

function Feature(title, desc, feature, clearOnReload)
{
	this.title = title;
	this.label = "Loading Feature";
	this.desc = desc;
	if (clearOnReload === false) this.clearOnReload = false;
	else this.clearOnReload = true;
	this.endpoint = "/photos";
	this.opts = {feature: feature};
	this.isSelected = Observable(false);
	var self = this;
	this.select = function()
	{
		if (selectedFeed.value === self) return;
		if (_loader) _loader.cancel();
		try
		{
			selectedFeed.value.isSelected.value = false;
			isFeedChanged = true;
		}
		catch (e)
		{
			isFeedChanged = false;
		}
		searching.value = false;
		self.isSelected.value = true;
		selectedFeed.value = self;
		api.SetPhotoStream(self.endpoint, self.opts);
	};
};

function Search()
{
	this.title = "Search";
	this.label = "Searching Photos";
	this.desc = "at 500px.com";
	this.clearOnReload = false;
	this.isSelected = Observable(false);
	var self = this;
	this.select = function()
	{
		if (selectedFeed.value === self) return;
		if (_loader) _loader.cancel();
		try { selectedFeed.value.isSelected.value = false; } catch (e) {}
		searching.value = true;
		isFeedChanged = true;
		self.isSelected.value = true;
		selectedFeed.value = self;
		api.SetSearchText(searchText.value);
	};
};

var feeds = Observable();
feeds.add(new Feature("Most Popular", "Trending Right Now", "popular"));
feeds.add(new Feature("Highest Rated", "Photos that Have Been Popular", "highest_rated"));
feeds.add(new Feature("Editor's Choice", "Picked by Top Photographers", "editors"));
feeds.add(new Feature("Upcoming", "Promising New Uploads", "upcoming", false));
feeds.add(new Feature("Fresh Today", "Latest from the Community", "fresh_today", false));
feeds.add(new Search());

function Photo(url, image_aspect, image_url, photo_url, name, avatar_url, username, votes_count)
{
	this.url = api.BASE_URL + url;
	this.image_url = image_url;
	this.image_aspect = image_aspect;
	this.photo_url = photo_url;
	this.name = html.unescape(name);
	this.avatar_url = avatar_url;
	this.username = "@" + username;
	this.user_url = api.BASE_URL + "/" + username;
	this.votes_count = votes_count;
}

function hasImage(image_url)
{
	for (var i=0; i<feed._values.length; i++) if (feed._values[i].image_url === image_url) return true;
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

function updateLoadingState()
{
	isReloading.value = false;
	isReloading.value = loadingState.value === LoadingState.Loading;
}

var _loader;

function reload()
{
	if (_loader) _loader.cancel();
	var _topscroll = isFeedChanged || selectedFeed.value.clearOnReload;
	var scrollTo = _topscroll ? "top" : null;
	_loader = helpers.Promise(function(resolve, reject)
	{
		loadingState.value = LoadingState.Loading;
		reloadErrorSign.value = "";
		isReloading.value = true;
		if (_topscroll)
		{
			feed.clear();
			scrollToUrl.value = scrollTo;
		}
		api.PhotoStream.Load().then(function(response)
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
		if (items.length > 0) for (var i=0; i<items.length; i++) feed.insertAt(i, items[i]);
		else if (feed.length === 0) displayError("No photos found");
		if (scrollTo !== null) scrollToUrl.value = scrollTo;
		loadingState.value = LoadingState.Ready;
	});
	_loader.catch(function(err)
	{
		if (err.name !== "CancellationError")
		{
			displayError(err);
			reloadErrorSign.value = "!";
		}
		loadingState.value = LoadingState.Ready;
	});
}

var _loadingmore = false;

function loadmore()
{
	_loader = helpers.Promise(function(resolve, reject)
	{
		api.PhotoStream.More().then(function(response)
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
		if (items.length === 0)
		{
			setTimeout(loadmore, 1); // sync current page
		}
	    else
	    {
	    	for (var i=0; i<items.length; i++) feed.add(items[i]); // expect probably less than RPP here but that's ok for a demo
			_loadingmore = false;
		}
	});
	_loader.catch(function(err)
	{
		if (err.name !== "CancellationError") displayError("Error loading more photos");
		_loadingmore = false;
	});
}

function more()
{
	if (loadingState.value !== LoadingState.Ready || _loadingmore) return;
	if (api.PhotoStream.current_page < api.PhotoStream.total_pages)
	{
		_loadingmore = true;
		loadmore();
	}
	else displayError("No more photos");
}

function onSidebarOpening()
{
	if (searching.value === true) event.raise("ReleaseSearchInput");
}

function onSidebarClosed()
{
	if (isFeedChanged)
	{
		if (searching.value === false) reload();
		else
		{
			feed.clear();
			scrollToUrl.value = "top";
		} 
		isFeedChanged = false;
		if (searching.value === true) event.raise("FocusSearchInput");
	}
}

function enableSidebar()
{
	isSidebarEnabled.value = true;
}

function disableSidebar()
{
	isSidebarEnabled.value = false;
}

function scrollToTop()
{
	scrollToUrl.value = "";
}

function onError(args)
{
	displayError(args.message);
}

function search()
{
	var text = searchText.value.trim();
	if (text !== "")
	{
		feed.clear();
		scrollToUrl.value = "top";
		api.SetSearchText(text);
		reload();
	}
}

// main
feeds.getAt(0).select();
reload();

module.exports =
{
	toast: toast,
	feed: feed,
	reload: reload,
	more: more,

	feeds: feeds,
	selectedFeed: selectedFeed,
	
	loadingState: loadingState,
	updateLoadingState: updateLoadingState,
	isReloading: isReloading,

	onError: onError,

	reloadErrorSign: reloadErrorSign,
	
	enableSidebar: enableSidebar,
	disableSidebar: disableSidebar,
	isSidebarEnabled: isSidebarEnabled,

	onSidebarOpening: onSidebarOpening,
	onSidebarClosed: onSidebarClosed,
	
	scrollToUrl: scrollToUrl,
	scrollToTop: scrollToTop,

	searching: searching,
	searchText: searchText,
	search: search
};
