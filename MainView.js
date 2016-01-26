var Observable = require('FuseJS/Observable');
var interApp = require('FuseJS/InterApp');
var vibration = require('FuseJS/Vibration');

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

function pulse(arg) {
	if (arg instanceof Observable) {
		arg.value = true;
		arg.value = false;
	}
}

var selectedFeature = Observable(features.value);

function selectFeature(feature) {
	pulse(toggleSidebar);
	if (loading.value === true) return;
	var featureName = (feature.data ? feature.data.name : feature.name);
	if (featureName !== selectedFeature.value.name) {
		setTimeout(function() {
			selectedFeature.value.selected.value = false;
			selectedFeature.value = (feature.data ? feature.data : feature);
			selectedFeature.value.selected.value = true;
			feed.clear();
			reload({scrollToUrl: ""}); // reset scroll position
		}, 500);
	}
}

var _spinner = null;
function startSpinning() {
	if (_spinner !== null) clearInterval(_spinner);
	_spinner = setInterval(function() {
		pulse(spinning);
	}, 1000);
}

function stopSpinning() {
	if (_spinner !== null) {
		clearInterval(_spinner);
		_spinner = null;
		spinning.value = false;
	}
}

function GalleryPhoto(url, image_url, image_width, image_height, photo_url, photo_width, photo_height)
{
	this.url = url;
	this.image_url = image_url;
	this.image_width = image_width;
	this.image_height = image_height;
	this.image_aspect = image_width / image_height;
	this.photo_url = photo_url;
	this.photo_width = photo_width;
	this.photo_height = photo_height;
}

function isPhoto(photo)
{
	for (var i=0; i<feed.length; i++)
		if (photo.url === feed.getAt(i).url) return true;
	return false;
}

function placeholderSize(width, height, max_edge)
{
	var ratio = width / height;
	if (width > height) {
		width = max_edge;
		height = width / ratio;
	} else {
		height = max_edge;
		width = height * ratio;
	}
	return {width: Math.ceil(width), height: Math.ceil(height)};
}

var _errorTimeout;
function displayError(err) {
	errorMessage.value = (err.message || err);
	clearTimeout(_errorTimeout);
	_errorTimeout = setTimeout(function() {
		errorMessage.value = "";
	}, ERROR_DISMISS_TIMEOUT);
}

function reload(opts) {
	if (loading.value === true) return;
	opts = opts || {};
	loading.value = true;
	startSpinning();
	var _scrollToUrl = opts.scrollToUrl;
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
			for (var i=responseObject.photos.length-1; i>=0; i--) {
				var responsePhoto = responseObject.photos[i];
				var image_url, photo_url;
		    	for (var j=0; j<responsePhoto.images.length; j++) {
		    		if (responsePhoto.images[j].size === 30) image_url = responsePhoto.images[j].https_url;
		    		else if (responsePhoto.images[j].size === 1080) photo_url = responsePhoto.images[j].https_url;
		    	}
		    	if (image_url && photo_url) {
			    	var image_size = placeholderSize(responsePhoto.width, responsePhoto.height, 256);
					var photo_size = placeholderSize(responsePhoto.width, responsePhoto.height, 1080);
			    	var galleryPhoto = new GalleryPhoto(responsePhoto.url, image_url, image_size.width, image_size.height, photo_url, photo_size.width, photo_size.height);
			    	if (!isPhoto(galleryPhoto)) {
			    		//if (typeof _scrollToUrl === "undefined") _scrollToUrl = galleryPhoto.image_url;
			    		feed.insertAt(0, galleryPhoto);
			    	}
			    }
			}
			while (feed.length > MAX_FEED_LENGHT) feed.removeAt(feed.length-1);
			resolve();
		})
		.catch(function(err) {
			reject(err);
		});
	})
	.then(function() {
		stopSpinning();
		loading.value = false;
		scrollToUrl.value = _scrollToUrl;
	})
	.catch(function(err) {
		stopSpinning();
		loading.value = false;	
		displayError(err);
		if (DEBUG) debug_log(JSON.stringify(err));
	});
}

function longPressed(args) {
	vibration.vibrate(0.02);
	interApp.launchUri('https://500px.com' + args.data.url);
}

var sidebarVisible = Observable(false);
var toggleSidebar = Observable(false);


function showSidebar() {
	sidebarVisible.value = true;
}

function hideSidebar() {
	sidebarVisible.value = false;
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

function refresh()
{
	reload();
}

// main
reload();

module.exports = {
	feed: feed,
	refresh: refresh,
	longPressed: longPressed,
	loading: loading,
	spinning: spinning,
	errorMessage: errorMessage,
	features: features,
	selectFeature: selectFeature,
	selectedFeature: selectedFeature,
	sidebarVisible: sidebarVisible,
	showSidebar: showSidebar,
	hideSidebar: hideSidebar,
	toggleSidebar: toggleSidebar,
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