# 500px gallery demo

## Screenshots
<img src="https://github.com/jveres/D500px/blob/master/Screenshot1.png?raw=true" width="250">
<img src="https://github.com/jveres/D500px/blob/master/Screenshot2.png?raw=true" width="250">
<img src="https://github.com/jveres/D500px/blob/master/Screenshot3.png?raw=true" width="250">

#### Nifty gallery app built with [Fusetools](https://www.fusetools.com/)

## There's an issue with JSON.parse() in V8 which brokes the Android build:(

<a href="https://github.com/jveres/D500px/blob/master/D500px-debug.apk?raw=true">APK Download</a>

## Features

* Gallery thumbnails are downloaded as they reveal in the scrollview
* Click on a thumbnail to view hi-res photo
* Displays spinner during hi-res image loading
* Swipe down the photo to dismiss details
* Loading spinner for hi-res images
* Long pressing an image opens its 500px page in the browser
* Automatic top scrolling between feature changes
* Clicking on the title scrolls the gallery view to the top
* Smooth animations

## Todo

- ~~fast image draw/background placeholders~~
- ~~image triggers: WhileLoaded, WhileFailed, WhileLoading~~
- ~~Http request error handling~~
- custom gallery layout
- D500px account login
- display photo details
- interactions (likes, commenting, etc)

*Note1: The app needs 500px consumer key passed in the fetch() request. Be nice and use/register your own.*

*Note2: Currently there are no atomic updates in Fuse yet so populating the gallery is something jerky.*

*Note3: This is still a work in progress.*

