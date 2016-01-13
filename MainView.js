var Observable = require('FuseJS/Observable');
var interApp = require('FuseJS/InterApp');
var vibration = require('FuseJS/Vibration');

var DEBUG = false;

var feed = Observable();
var loading = Observable(false);
var spinning = Observable(false);
var errorMessage = Observable('');
var goHome = Observable(false);
var scrollToUrl = Observable("");

var FETCH_TIMEOUT = 15*1000;
var MAX_PHOTOS = 40;
var ERROR_DISMISS_TIMEOUT = 5*1000;

var navbarVisible = Observable(true);
var EMPTY_PHOTO = {photo_url: ""};
var currentImage = Observable(EMPTY_PHOTO);

function Feature(name, query, selected) {
	this.name =  name;
	this.query = query;
	this.selected = Observable(selected || false);
};

var features = Observable();
features.add(new Feature('Most Popular','popular', true));
features.add(new Feature('Highest Rated', 'highest_rated'));
features.add(new Feature('Upcoming', 'upcoming'));
features.add(new Feature('Editor\'s Pick', 'editors'));
features.add(new Feature('Fresh Today', 'fresh_today'));

function pulse(arg) {
	if (arg instanceof Observable) {
		arg.value = true;
		arg.value = false;
	}
}

var selectedFeature = features.value;
var selectedFeatureName = Observable(selectedFeature.name);

function selectFeature(feature) {
	pulse(goHome);
	if (loading.value === true) return;
	var featureName = (feature.data ? feature.data.name : feature.name);
	if (!selectedFeature || (featureName !== selectedFeature.name)) {
		setTimeout(function() {
			if (selectedFeature) selectedFeature.selected.value = false;
			selectedFeature = (feature.data ? feature.data : feature);
			selectedFeature.selected.value = true;
			selectedFeatureName.value = featureName;
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
	new Promise(function(resolve, reject) {
		var isTimedout = false;
		var timeout = setTimeout(function() {
			isTimedout = true;
			reject(new Error('Request timed out'));
		}, FETCH_TIMEOUT);
		fetch('https://api.500px.com/v1/photos?feature=' + selectedFeature.query + '&sort=created_at&image_size=30,1080&rpp=' + MAX_PHOTOS + '&consumer_key=G7ZWcGQU5W395mCb0xx3dccp6x0fvQB8G8JCSaDg')
		.then(function(response) {
			clearTimeout(timeout);
			if (isTimedout) return reject(new Error('Request timed out'));
			if (response && response.status == 200) return response.json();
			else reject(new Error('Response error'));
		})
		.then(function(responseObject) {
			if (DEBUG) debug_log(JSON.stringify(responseObject.photos[0]));
			var new_items = 0;
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
			    		new_items++;
			    		feed.insertAt(0, galleryPhoto);
			    	}
			    }
			}
			resolve();
		})
		.catch(function(err) {
			reject(err);
		});
	})
	.then(function() {
		stopSpinning();
		loading.value = false;
		if (typeof opts.scrollToUrl == "string") scrollToUrl.value = opts.scrollToUrl;
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

function hideNavbar() {
	navbarVisible.value = false;
}

function showNavbar() {
	navbarVisible.value = true;
}

var navigationEnabled = Observable(true);
var navigationEdge = Observable("Left");

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
	currentImage.value = EMPTY_PHOTO;
}

function showImageLoadingError()
{
	displayError("Image loading error");
}

// main
reload();

module.exports = {
	feed: feed,
	reload: reload,
	longPressed: longPressed,
	loading: loading,
	spinning: spinning,
	errorMessage: errorMessage,
	features: features,
	selectFeature: selectFeature,
	selectedFeatureName: selectedFeatureName,
	goHome: goHome,
	navbarVisible: navbarVisible,
	hideNavbar: hideNavbar,
	showNavbar: showNavbar,
	disableNavigation: disableNavigation,
	enableNavigation: enableNavigation,
	navigationEnabled: navigationEnabled,
	navigationEdge: navigationEdge,
	selectImage: selectImage,
	deselectImage: deselectImage,
	currentImage: currentImage,
	showImageLoadingError: showImageLoadingError,
	scrollToUrl: scrollToUrl
};