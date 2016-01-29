var Observable = require('FuseJS/Observable');
var interApp = require('FuseJS/InterApp');
var vibration = require('FuseJS/Vibration');
var app = require('FuseJS/Lifecycle');

var DEBUG = false;

var feed = Observable();
var loading = Observable(false);
var spinning = Observable(false);
var errorMessage = Observable('');
var scrollToUrl = Observable("");

var FETCH_TIMEOUT = 15*1000;
var MAX_PHOTOS = 40;
var MAX_FEED_LENGHT = 120;
var ERROR_DISMISS_TIMEOUT = 5*1000;

var navbarVisible = Observable(true);
var EMPTY_PHOTO = {photo_url: ""}
var currentImage = Observable(EMPTY_PHOTO);

function Feature(name, desc, query, selected) {
	this.name =  name;
	this.desc =  desc;
	this.query = query;
	this.selected = Observable(selected || false);
};

var features = Observable();
features.add(new Feature('Most Popular', 'Trending Right Now', 'popular', true));
features.add(new Feature('Highest Rated', 'Photos that Have Been Popular', 'highest_rated'));
features.add(new Feature('Editor\'s Choice', 'Picked by Top Photographers', 'editors'));
features.add(new Feature('Upcoming', 'Promising New Uploads', 'upcoming'));
features.add(new Feature('Fresh Today', 'Latest from the Community', 'fresh_today'));

var selectedFeature = Observable(features.value);

function selectFeature(feature) {
	if (loading.value === true) return;
	var featureName = (feature.data ? feature.data.name : feature.name);
	if (featureName !== selectedFeature.value.name) {
		setTimeout(function() {
			selectedFeature.value.selected.value = false;
			selectedFeature.value = (feature.data ? feature.data : feature);
			selectedFeature.value.selected.value = true;
			feed.clear();
			reload(""); // reset scroll position
		}, 500);
	}
}

function Photo(url, image_aspect, image_url, photo_url)
{
	this.url = url;
	this.image_url = image_url;
	this.image_aspect = image_aspect;
	this.photo_url = photo_url;
}

function isImage(image_url, items)
{
	for (var i=0; i<items.length; i++)
		if (items[i].image_url == image_url) return true;
	return false;
}

var _errorTimeout;
function displayError(err) {
	errorMessage.value = (err.message || err);
	clearTimeout(_errorTimeout);
	_errorTimeout = setTimeout(function() {
		errorMessage.value = "";
	}, ERROR_DISMISS_TIMEOUT);
}

var newItems = [], toUrl = undefined, fetching = false;

function startLoading() {
	toUrl = undefined;
	fetching = true;
	loading.value = true;
	checkLoading();
}

function checkLoading() {
	spinning.value = false;
	spinning.value = fetching;
	if (!fetching) 
	{
		new Promise(function(resolve) {
			for (var i=0; i<newItems.length; i++) feed.insertAt(0, newItems[i]);
			while (feed.length>MAX_FEED_LENGHT) feed.removeAt(feed.length-1);
			return resolve();
		})
		.then(function() {
			if (typeof toUrl !== 'undefined') scrollToUrl.value = toUrl;
			loading.value = false;
		});
	}
}

function stopLoading() {
	fetching = false;
}

function reload(url) {
	if (loading.value === true) return;
	startLoading();
	new Promise(function(resolve, reject) {
		var isTimedout = false;
		var timeout = setTimeout(function() {
			isTimedout = true;
			reject(new Error('Request timed out'));
		}, FETCH_TIMEOUT);
		fetch('https://api.500px.com/v1/photos?feature=' + selectedFeature.value.query + '&image_size=30,1080&rpp=' + MAX_PHOTOS + '&consumer_key=G7ZWcGQU5W395mCb0xx3dccp6x0fvQB8G8JCSaDg')
		.then(function(response) {
			clearTimeout(timeout);
			if (isTimedout) return reject(new Error('Request timed out'));
			if (response && response.status == 200) return response.json();
			else reject(new Error(response ? 'Response error (' + response.status + ')' : 'No response from server'));
		})
		.then(function(responseObject) {
			if (DEBUG) debug_log(JSON.stringify(responseObject.photos[0]));
			newItems = [];
			for (var i=0; i<responseObject.photos.length; i++) {
				var responsePhoto = responseObject.photos[i];
				var image_url, photo_url;
		    	for (var j=0; j<responsePhoto.images.length; j++) {
		    		if (responsePhoto.images[j].size === 30) image_url = responsePhoto.images[j].https_url;
		    		else if (responsePhoto.images[j].size === 1080) photo_url = responsePhoto.images[j].https_url;
		    	}
		    	if (!isImage(image_url, feed._values) && !isImage(image_url, newItems) && image_url && photo_url) {
			    	var image_aspect = responsePhoto.width / responsePhoto.height;
			    	newItems.splice(0, 0, new Photo(responsePhoto.url, image_aspect === 1 ? 1.0001 : image_aspect, image_url, photo_url));
			    }
			}
			resolve();
		})
		.catch(function(err) {
			reject(err);
		});
	})
	.then(function() {
		toUrl = url;
		stopLoading();
	})
	.catch(function(err) {
		stopLoading();
		displayError(err);
		if (DEBUG) debug_log(JSON.stringify(err));
	});
}

function longPressed(args) {
	vibration.vibrate(0.02);
	interApp.launchUri('https://500px.com' + args.data.url);
}

function hideNavbar() {
	navbarVisible.value = false;
}

function showNavbar() {
	navbarVisible.value = true;
}

var navigationEnabled = Observable(true);

function enableNavigation() {
	navigationEnabled.value = true;
}

function disableNavigation() {
	navigationEnabled.value = false;
}

function selectImage(args) {
	currentImage.value = args.data;
}

function deselectImage(args) {
	currentImage.value = EMPTY_PHOTO; // aborts current download
}

function showImageLoadingError()
{
	displayError("Image loading error");
}

function scrollToTop()
{
	scrollToUrl.value = "";
}

reload();

module.exports = {
	feed: feed,
	reload: reload,
	longPressed: longPressed,
	loading: loading,
	spinning: spinning,
	checkLoading: checkLoading,
	errorMessage: errorMessage,
	features: features,
	selectFeature: selectFeature,
	selectedFeature: selectedFeature,
	navbarVisible: navbarVisible,
	hideNavbar: hideNavbar,
	showNavbar: showNavbar,
	disableNavigation: disableNavigation,
	enableNavigation: enableNavigation,
	navigationEnabled: navigationEnabled,
	selectImage: selectImage,
	deselectImage: deselectImage,
	currentImage: currentImage,
	showImageLoadingError: showImageLoadingError,
	scrollToUrl: scrollToUrl,
	scrollToTop: scrollToTop
};
