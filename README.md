Cordova BackgroundMode-Plugin
==============================

A bunch of background mode plugins for Cordova 3.x.x

by Sebastián Katzer ([github.com/katzer](https://github.com/katzer))

## Supported Platforms
- **iOS**

## Adding the Plugin to your project
Through the [Command-line Interface](http://cordova.apache.org/docs/en/3.0.0/guide_cli_index.md.html#The%20Command-line%20Interface):
```
cordova plugin add https://github.com/katzer/cordova-plugin-background-mode.git
```

## Removing the Plugin from your project
Through the [Command-line Interface](http://cordova.apache.org/docs/en/3.0.0/guide_cli_index.md.html#The%20Command-line%20Interface):
```
cordova plugin rm de.appplant.cordova.plugin.background-mode
```

## Release Notes
#### Version 0.2.0 (not yet released)
- Added iOS support<br>
  The plugin turns the app into a location tracking app for the time it runs in the background.

## Using the plugin
The plugin comes without a js interface. Simply add the plugin to your project and the app will run while in background mode.

## Quirks

### The app crashes under iOS
If the app crashes after installing the plugin, make sure that your `*-Info.plist` is valid.
Do to some bugs in cordova or Plugman please reset all occurences like
```xml
<key>NSMainNibFile</key>
<string>

</string>
```
into
```xml
<key>NSMainNibFile</key>
<string></string>
```
