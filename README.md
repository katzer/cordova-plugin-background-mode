<p align="left">
    <b><a href="https://github.com/katzer/cordova-plugin-background-mode/tree/example">SAMPLE APP</a> :point_right:</b>
</p>

# Cordova Background Plugin

Plugin for the [Cordova][cordova] framework to perform infinite background execution.

Most mobile operating systems are multitasking capable, but most apps don't need to run while in background and not
present for the user. Therefore, they pause the app in background mode and resume the app before switching to foreground
mode.
The system keeps all network connections open while in background, but does not deliver the data until the app resumes.

<!-- TOC -->

* [Cordova Background Plugin](#cordova-background-plugin)
  * [Store Compliance](#store-compliance)
  * [Supported Platforms](#supported-platforms)
  * [Installation](#installation)
  * [Usage](#usage)
    * [Enable the background mode](#enable-the-background-mode)
    * [Check if running in background](#check-if-running-in-background)
    * [Listen for events](#listen-for-events)
  * [Android specifics](#android-specifics)
    * [Transit between application states](#transit-between-application-states)
    * [Back button](#back-button)
    * [Recent task list](#recent-task-list)
    * [Detect screen status](#detect-screen-status)
    * [Unlock and wake-up](#unlock-and-wake-up)
    * [Notification](#notification)
      * [Override defaults](#override-defaults)
      * [Add an icon file](#add-an-icon-file)
      * [Run in background without notification](#run-in-background-without-notification)
  * [Quirks](#quirks)
  * [License](#license)

<!-- TOC -->

## Store Compliance

Infinite background tasks are not official supported on most mobile operating systems and thus not compliant with public
store vendors. A successful submssion isn't garanteed.

Use the plugin by your own risk!

## Supported Platforms

- __Android/Amazon FireOS__
- __Browser__
- __iOS__
- __Windows__ _(see #222)_

## Installation

The plugin can be installed via [Cordova-CLI][CLI].

Execute from the projects root folder:

```text
cordova plugin add https://github.com/nextivity/cordova-plugin-background-mode
```

## Usage

The plugin creates the object `cordova.plugins.backgroundMode` and is accessible after the *deviceready* event has been
fired.

```js
document.addEventListener('deviceready', function () {
  // cordova.plugins.backgroundMode is now available
}, false);
```

### Enable the background mode

The plugin is not enabled by default. Once it has been enabled the mode becomes active if the app moves to background.

```js
cordova.plugins.backgroundMode.enable();
// or
cordova.plugins.backgroundMode.setEnabled(true);
```

To disable the background mode:

```js
cordova.plugins.backgroundMode.disable();
// or
cordova.plugins.backgroundMode.setEnabled(false);
```

### Check if running in background

Once the plugin has been enabled and the app has entered the background, the background mode becomes active.

```js
cordova.plugins.backgroundMode.isActive(); // => boolean
```

A non-active mode means that the app is in foreground.

### Listen for events

The plugin fires an event each time its status has been changed. These events
are `enable`, `disable`, `activate`, `deactivate` and `failure`.

```js
cordova.plugins.backgroundMode.on('EVENT', function);
```

To remove an event listeners:

```js
cordova.plugins.backgroundMode.un('EVENT', function);
```

## Android specifics

### Transit between application states

Android allows to programmatically move from foreground to background or vice versa.

```js
cordova.plugins.backgroundMode.moveToBackground();
// or
cordova.plugins.backgroundMode.moveToForeground();
```

### Back button

Override the back button on Android to go to background instead of closing the app.

```js
cordova.plugins.backgroundMode.overrideBackButton();
```

### Recent task list

Exclude the app from the recent task list works on Android 5.0+.

```js
cordova.plugins.backgroundMode.excludeFromTaskList();
```

### Detect screen status

The method works async instead of _isActive()_ or _isEnabled()_.

```js
cordova.plugins.backgroundMode.isScreenOff(function (bool) {
...
});
```

### Unlock and wake-up

A wake-up turns on the screen while unlocking moves the app to foreground even the device is locked.

```js
// Turn screen on
cordova.plugins.backgroundMode.wakeUp();
// Turn screen on and show app even locked
cordova.plugins.backgroundMode.unlock();
```

### Notification

To indicate that the app is executing tasks in background and being paused would disrupt the user, the plug-in has to
create a notification while in background - like a download progress bar.

#### Override defaults

The title, text and icon for that notification can be customized as below. Also, by default the app will come to
foreground when tapping on the notification. That can be changed by setting resume to false. On Android 5.0+, the color
option will set the background color of the notification circle. Also on Android 5.0+, setting hidden to false will make
the notification visible on lockscreen.

```js
cordova.plugins.backgroundMode.setDefaults({
  title: String,
  text: String,
  icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
  color: String, // hex format like 'F14F4D'
  resume: Boolean,
  hidden: Boolean,
  bigText: Boolean
})
```

__Note:__ All properties are optional - only override the things you need to.

#### Add an icon file

To add an image asset to be used as a notification icon add a resource file definition to the projects `config.xml`.

```xml
<!-- config.xml -->

<platform name="android">
  <!-- Add a notification icon image -->
  <!-- "src" is where the image is; from the project root  -->
  <!-- "target" needs to be the `drawable` dir inside `platforms/android` and the file name must match the `icon` string given in  `cordova.plugins.backgroundMode.setDefaults` -->
  <resource-file src="res/icon/android/icon.png" target="app/src/main/res/drawable/icon.png"/>
</platform>
```

To modify the currently displayed notification

```js
cordova.plugins.backgroundMode.configure({...});
```

#### Run in background without notification

In silent mode the plugin will not display a notification - which is not the default. Be aware that Android recommends
adding a notification otherwise the OS may pause the app.

```js
cordova.plugins.backgroundMode.setDefaults({silent: true});
```

## Quirks

Various APIs like playing media or tracking GPS position in background might not work while in background even the
background mode is active. To fix such issues the plugin provides a method to disable most optimizations done by
Android/CrossWalk.

```js
cordova.plugins.backgroundMode.on('activate', function () {
  cordova.plugins.backgroundMode.disableWebViewOptimizations();
});
```

__Note:__ Calling the method led to increased resource and power consumption.

## License

This software is released under the [Apache 2.0 License][apache2_license].

Made with :yum: from Leipzig

? 2017 [appPlant GmbH][appplant] & [meshfields][meshfields]


[cordova]: https://cordova.apache.org

[CLI]: http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-line%20Interface

[changelog]: CHANGELOG.md

[apache2_license]: http://opensource.org/licenses/Apache-2.0

[appplant]: http://appplant.de

[meshfields]: http://meshfields.de