var Observable = require('FuseJS/Observable');
var interApp = require('FuseJS/InterApp');
var Stopwatch = require("Stopwatch");
var vibration = require('FuseJS/Vibration');

var feed = Observable();
var loading = Observable(false);
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
	arg.value = true;
	arg.value = false;
}

function selectFeature(feature) {
	if (selectedFeature) selectedFeature.selected.value = false;
	selectedFeature = (feature.data ? feature.data : feature);
	selectedFeature.selected.value = true;
	selectedFeatureName.value = selectedFeature.name;
	reload(true);
}

selectFeature(features.value);

function reload() {
	if (loading.value === true) return;
	loading.value = true;
	pulse(goHome);
	new Promise(function(resolve, reject) {
		Stopwatch.Start();
		error.value = false;
		errorMessage.value = "";
		var timeout = setTimeout(function() {
			reject(new Error('Request timed out'));
		}, FETCH_TIMEOUT);
		fetch('https://api.500px.com/v1/photos?feature=' + selectedFeature.query + '&sort=created_at&image_size=30&exclude=Nude&rpp=' + MAX_PHOTOS + '&consumer_key=G7ZWcGQU5W395mCb0xx3dccp6x0fvQB8G8JCSaDg')
		.then(function(response) {
			clearTimeout(timeout);
			if (response && response.status == 200) return response.json();
			else reject(new Error('Response error'));
		})
		.then(function(responseObject) {
			feed.value = responseObject;
			resolve();
		})
		.catch(function(err) {
			reject(err);
		});
	})
	.then(function() {
		Stopwatch.Pause();
		loading.value = false;
	})
	.catch(function(err) {
		loading.value = false;
		Stopwatch.Pause();
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
	error: error,
	errorMessage: errorMessage,
	features: features,
	selectFeature: selectFeature,
	selectedFeatureName: selectedFeatureName,
	goHome: goHome
};
