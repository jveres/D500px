var Observable = require('FuseJS/Observable');
var interApp = require('FuseJS/InterApp');
var vibration = require('FuseJS/Vibration');

var DEBUG = false;

var feed = Observable();
var loading = Observable(false);
var spinning = Observable(false);
var error = Observable(false);
var errorMessage = Observable('');
var FETCH_TIMEOUT = 15*1000;
var MAX_PHOTOS = 40;

function Feature(name, query, selected) {
	this.name =  name;
	this.query = query;
	this.selected = Observable(selected || false);
};

var features = Observable();
features.add(new Feature('Most Popular','popular'));
features.add(new Feature('Highest Rated', 'highest_rated'));
features.add(new Feature('Upcoming', 'upcoming'));
features.add(new Feature('Editor\'s Pick', 'editors'));
features.add(new Feature('Fresh Today', 'fresh_today'));

var selectedFeature = undefined;
var selectedFeatureName = Observable('');
var goHome = Observable(false);

function pulse(arg) {
	if (arg instanceof Observable) {
		arg.value = true;
		arg.value = false;
	}
}

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
			feed.value = {photos: []};
			reload();
		}, 500);
	}
}

selectFeature(features.value);

var _spinner = null;
function startSpinning() {
	if (_spinner !== null) clearInterval(_spinner);
	_spinner = setInterval(function() {
		spinning.value = true;
		spinning.value = false;
	}, 1000);
}

function stopSpinning() {
	if (_spinner !== null) {
		clearInterval(_spinner);
		_spinner = null;
		spinning.value = false;
	}
}

function GalleryPhoto(url, image_url, image_width, image_height)
{
	this.url = url;
	this.image_url = image_url;
	this.image_width = image_width;
	this.image_height = image_height;
}

var _urls = [];

function IsPhoto(photo)
{
	for (var i=0; i<feed.value.photos.length; i++)
		if (photo.url === feed.value.photos[i].url) return true;
	return false;
}

function reload() {
	if (loading.value === true) return;
	loading.value = true;
	startSpinning();
	new Promise(function(resolve, reject) {
		error.value = false;
		errorMessage.value = "";
		var timeout = setTimeout(function() {
			reject(new Error('Request timed out'));
		}, FETCH_TIMEOUT);
		fetch('https://api.500px.com/v1/photos?feature=' + selectedFeature.query + '&sort=created_at&image_size=30&rpp=' + MAX_PHOTOS + '&consumer_key=G7ZWcGQU5W395mCb0xx3dccp6x0fvQB8G8JCSaDg')
		.then(function(response) {
			clearTimeout(timeout);
			if (response && response.status == 200) return response.json();
			else reject(new Error('Response error'));
		})
		.then(function(responseObject) {
			if (DEBUG) debug_log(JSON.stringify(responseObject.photos[0]));
			for (var i=0; i<responseObject.photos.length; i++) {
				var photo = responseObject.photos[i];
				var w = photo.width;
				var h = photo.height;
				var r = w / h;
				var m = 256.0;
				if (w > h) {
		    		w = m;
		    		h = w / r;
		    	} else {
		    		h = m;
		    		w = h * r;
		    	}
		    	photo.image_width = Math.ceil(w);
		    	photo.image_height = Math.ceil(h);
		    	var galleryPhoto = new GalleryPhoto(photo.url, photo.image_url, photo.image_width, photo.image_height);
		    	if (!IsPhoto(galleryPhoto)) feed.value.photos.splice(0, 0, galleryPhoto);
			}
			feed.value = feed.value; // hmm
			resolve();
		})
		.catch(function(err) {
			reject(err);
		});
	})
	.then(function() {
		stopSpinning();
		loading.value = false;
	})
	.catch(function(err) {
		stopSpinning();
		loading.value = false;
		errorMessage.value = err.message + ", try again...";
		error.value = true;
	});
}

function longPressed(args) {
	vibration.vibrate(0.03);
	interApp.launchUri('http://500px.com/' + args.data.url);
}

module.exports = {
	feed: feed,
	reload: reload,
	longPressed: longPressed,
	loading: loading,
	spinning: spinning,
	error: error,
	errorMessage: errorMessage,
	features: features,
	selectFeature: selectFeature,
	selectedFeatureName: selectedFeatureName,
	goHome: goHome
};
