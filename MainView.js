var Observable = require("FuseJS/Observable");
var app = require("FuseJS/Lifecycle");
var html = require("Html");
var api = require("Api");

var feed = Observable();
var loading = Observable(false);
var spinning = Observable(false);
var toast = Observable("");
var scrollToUrl = Observable("");

var ERROR_DISMISS_TIMEOUT = 2*1000;

var featureChanged = false;
var navbarVisible = Observable(true);
var navigationEnabled = Observable(true);

function Feature(name, desc, query, selected)
{
	this.name =  name;
	this.desc =  desc;
	this.query = query;
	this.selected = Observable(selected || false);
};

var features = Observable();
features.add(new Feature("Most Popular", "Trending Right Now", "popular", true));
features.add(new Feature("Highest Rated", "Photos that Have Been Popular", "highest_rated"));
features.add(new Feature("Editor's Choice", "Picked by Top Photographers", "editors"));
features.add(new Feature("Upcoming", "Promising New Uploads", "upcoming"));
features.add(new Feature("Fresh Today", "Latest from the Community", "fresh_today"));

function selectFeature(feature)
{
	var featureName = (feature.data ? feature.data.name : feature.name);
	if (featureName !== selectedFeature.value.name)
	{
		selectedFeature.value.selected.value = false;
		selectedFeature.value = (feature.data ? feature.data : feature);
		selectedFeature.value.selected.value = true;
		api.SetFeature(selectedFeature.value.query);
		featureChanged = true;
	}
}

function Photo(url, image_aspect, image_url, photo_url, name, avatar_url, username, votes_count)
{
	this.url = api.BASE_URL + url;
	this.image_url = image_url;
	this.image_aspect = image_aspect;
	this.photo_url = photo_url;
	this.name = html.unescape(name);
	this.avatar_url = /*avatar_url*/""; // Fuse issue: https://www.fusetools.com/community/forums/bug_reports/httpimagesource_runtime_exception_2
	this.username = "@" + username;
	this.user_url = api.BASE_URL + "/" + username;
	this.votes_count = votes_count;
}

function isImage(image_url)
{
	for (var i=0; i<feed._values.length; i++) if (feed._values[i].image_url == image_url) return true;
	return false;
}

var _errorTimeout;
function displayError(err)
{
	toast.value = (err.message || err);
	clearTimeout(_errorTimeout);
	_errorTimeout = setTimeout(function() { toast.value = ""; }, ERROR_DISMISS_TIMEOUT);
}

var fetching = false;
var new_items = [];

function startLoading()
{
	fetching = true;
	loading.value = true;
	checkLoading();
}

function checkLoading()
{
	spinning.value = false;
	spinning.value = fetching;
	if (fetching === false) 
	{
		for (var i=0; i<new_items.length; i++) feed.insertAt(i, new_items[i]);
		scrollToUrl.value = "top";
		loading.value = false;
	}
}

function stopLoading()
{
	fetching = false;
}

function processStream(response, target)
{
	for (var i=0; i<response.photos.length; i++)
	{
		var responsePhoto = response.photos[i];
		var image_url, photo_url;
    	for (var j=0; j<responsePhoto.images.length; j++)
    	{
    		if (responsePhoto.images[j].size === 30) image_url = responsePhoto.images[j].https_url;
    		else if (responsePhoto.images[j].size === 1080) photo_url = responsePhoto.images[j].https_url;
    	}
    	if (!isImage(image_url))
    	{
	    	var image_aspect = responsePhoto.width / responsePhoto.height;
	    	target.push(new Photo(
	    		responsePhoto.url,
				image_aspect === 1 ? 1.0001 : image_aspect, // Fuse's Aspect bug workaround
				image_url,
				photo_url,
				responsePhoto.name,
				responsePhoto.user.avatars.small.https,
				responsePhoto.user.username,
				responsePhoto.votes_count)
	    	);
	    }
	}
}

function reload()
{
	if (loading.value === true) return;
	startLoading();
	new_items = [];
	feed.clear();
	api.PhotoStream.Load()
	.then(function(response)
	{
		processStream(response, new_items);
		stopLoading();
	})
	.catch(function(err)
	{
		stopLoading();
		displayError(err);
	});
}

var more_items = [];
var loading_more = false;

function loadMore()
{
	var more = api.PhotoStream.More();
	if (more)
	{
		more.then(function(response)
		{
			processStream(response, more_items);
			if (more_items.length === 0) {
				setTimeout(loadMore, 0); // sync current page
			}
			else
			{
				// expect probably less than RPP here but that's ok for the demo
				for (var i=0; i<more_items.length; i++) feed.add(more_items[i]);
				loading_more = false;
			}
		})
		.catch(function(err)
		{
			loading_more = false;
			displayError(err);
		});
	}
	else loading_more = false;
}

function more()
{
	if (loading_more || loading.value === true) return;
	loading_more = true;
	more_items = [];
	loadMore();
}

function hideNavbar()
{
	navbarVisible.value = false;
}

function showNavbar()
{
	navbarVisible.value = true;
}

function enableNavigation()
{
	navigationEnabled.value = true;
}

function disableNavigation()
{
	navigationEnabled.value = false;
}

function scrollToTop()
{
	scrollToUrl.value = "";
}

function onError(args)
{
	displayError(args.message);
}

function isFeatureChanged()
{
	if (featureChanged === true)
	{
		featureChanged = false;
		reload();
	}
}

// main
var selectedFeature = Observable(features.value);
api.SetFeature(selectedFeature.value.query);
reload();

module.exports =
{
	feed: feed,
	reload: reload,
	more: more,
	
	loading: loading,
	spinning: spinning,
	
	toast: toast,
	onError: onError,
	
	checkLoading: checkLoading,
	
	features: features,
	selectFeature: selectFeature,
	selectedFeature: selectedFeature,
	isFeatureChanged: isFeatureChanged,
	
	navbarVisible: navbarVisible,
	hideNavbar: hideNavbar,
	showNavbar: showNavbar,
	
	disableNavigation: disableNavigation,
	enableNavigation: enableNavigation,
	navigationEnabled: navigationEnabled,
	
	scrollToUrl: scrollToUrl,
	scrollToTop: scrollToTop
};
