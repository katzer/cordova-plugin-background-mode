
<p align="right">
    <a href="https://github.com/katzer/cordova-plugin-background-mode/tree/example">EXAMPLE :point_right:</a>
</p>

Cordova Background Plug-in
==========================

[Cordova][cordova] plugin to prevent the app from going to sleep while in background.

Most mobile operating systems are multitasking capable, but most apps dont need to run while in background and not present for the user. Therefore they pause the app in background mode and resume the app before switching to foreground mode.
The system keeps all network connections open while in background, but does not deliver the data until the app resumes.

### Plugin's Purpose
This cordova plug-in can be used for applications, who rely on continuous network communication independent of from direct user interactions and remote push notifications.

### :bangbang: Store Compliance :bangbang:
The plugin focuses on enterprise-only distribution and may not compliant with all public store vendors.


## Overview
1. [Supported Platforms](#supported-platforms)
2. [Installation](#installation)
3. [ChangeLog](#changelog)
4. [Using the plugin](#using-the-plugin)
5. [Examples](#examples)
6. [Platform specifics](#platform-specifics)
7. [Quirks](#quirks)


## Supported Platforms
- __iOS__
- __Android__
- __WP8__


## Installation
The plugin can either be installed from git repository, from local file system through the [Command-line Interface][CLI]. Or cloud based through [PhoneGap Build][PGB].

### Local development environment
From master:
```bash
# ~~ from master branch ~~
cordova plugin add https://github.com/katzer/cordova-plugin-background-mode.git
```
from a local folder:
```bash
# ~~ local folder ~~
cordova plugin add de.appplant.cordova.plugin.background-mode --searchpath path
```
or to use the last stable version:
```bash
# ~~ stable version ~~
cordova plugin add de.appplant.cordova.plugin.background-mode@0.5.0
```

### PhoneGap Build
Add the following xml to your config.xml to always use the latest version of this plugin:
```xml
<gap:plugin name="de.appplant.cordova.plugin.background-mode" version="0.5.0" />
```

More informations can be found [here][PGB_plugin].


## ChangeLog
#### Version 0.6.0 (not yet released)
- [feature:] Android support
- [___change___:] Disabled by default
- [enhancement:] iOS does not require user permissions, internet connection and geo location anymore.

#### Further informations
- The former `plugin.backgroundMode` namespace has been deprecated and will be removed with the next major release.
- See [CHANGELOG.md][changelog] to get the full changelog for the plugin.


## Using the plugin
The plugin creates the object ```cordova.plugins.backgroundMode``` with  the following methods:

1. [backgroundMode.enable][enable]
2. [backgroundMode.disable][disable]
2. [backgroundMode.configure][configure]

### Plugin initialization
The plugin and its methods are not available before the *deviceready* event has been fired.

```javascript
document.addEventListener('deviceready', function () {
    // cordova.plugins.backgroundMode is now available
}, false);
```

### Prevent the app from going to sleep in background
To prevent the app from being paused while in background, the `backroundMode.enable` interface has to be called.

#### Further informations
- The background mode will be activated once the app has entered the background and will be deactivated after the app has entered the foreground.
- To activate the background mode the app needs to be in foreground.

```javascript
window.plugin.backgroundMode.enable();
```

### Pause the app while in background
The background mode can be disabled through the `backgroundMode.disable` interface.

#### Further informations
- Once the background mode has been disabled, the app will be paused when in background.

```javascript
window.plugin.backgroundMode.disable();
```


## Examples
The following example demonstrates how to enable the background mode after device is ready. The mode itself will be activated when the app has entered the background.

```javascript
document.addEventListener('deviceready', function () {
    // Enable background mode
    cordova.plugins.backgroundMode.enable();
    // Android customization
    cordova.plugins.backgroundMode.configure({ text:'Doing heavy tasks.'});
}, false);
```


## Platform specifics

### Android Customization

To indicate, that the app is executing tasks in background and being paused would disrupt the user, the plug-in has to create a notification while in background like a download progress bar.

The title, ticker and text for that notification can be customized in the following way at any time:

```javascript
cordova.plugins.backgroundMode.configure({
    title:  String,
    ticker: String,
    text:   String
})
```

By default the app will come to foreground when taping on the notification. That can be changed also.

```javascript
cordova.plugins.backgroundMode.configure({
    resume: false
})
```


### WP8 Optimization
By default the plugin will track for geo updates while the application is in background and foreground. To stop tracking in foreground, the `MainPage.xaml.cs` file needs the following 2 methods:

```c#
// MainPage.xaml.cs

namespace your.own.namespace
{
    public partial class MainPage : PhoneApplicationPage
    {
        /// </summary>
        /// The page (the app) will enter the background and the background mode
        /// needs to be activated.
        /// </summary>
        protected override void OnNavigatingFrom(System.Windows.Navigation.NavigatingCancelEventArgs e)
        {
            Cordova.Extension.Commands.BackgroundMode.Activate();
        }

        /// </summary>
        /// The page (the app) will enter the foreground and the background mode
        /// needs to be deactivated.
        /// </summary>
        protected override void OnNavigatedTo(System.Windows.Navigation.NavigationEventArgs e)
        {
            Cordova.Extension.Commands.BackgroundMode.Deactivate();
        }
    }
}
```


## Quirks

### iOS Crash
If the app crashes after installing the plugin, make sure that your `*-Info.plist` is valid and reset all occurences of blank strings

```xml
<key>NSMainNibFile</key>
<string>

</string>
```

to

```xml
<key>NSMainNibFile</key>
<string></string>
```


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request


## License

This software is released under the [Apache 2.0 License][apache2_license].

© 2013-2014 appPlant UG, Inc. All rights reserved


[cordova]: https://cordova.apache.org
[CLI]: http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-line%20Interface
[PGB]: http://docs.build.phonegap.com/en_US/index.html
[PGB_plugin]: https://build.phonegap.com/plugins/490
[changelog]: CHANGELOG.md
[enable]: #prevent-the-app-from-going-to-sleep-in-background
[disable]: #pause-the-app-while-in-background
[configure]: #android-customization
[apache2_license]: http://opensource.org/licenses/Apache-2.0
[appplant]: http://appplant.de
