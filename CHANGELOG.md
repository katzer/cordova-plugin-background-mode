## ChangeLog
#### Version 0.7.2 (02.02.2017)
- Fixed app freeze on iOS using wkwebview-engine
- Websocket sample in SampleApp

#### Version 0.7.1 (30.01.2017)
- Bug fixes for iOS9 and Android
- Allow app to be excluded from recent list on Android

#### Version 0.7.0 (27.01.2017)
- __Features__
 - Support for tAmazon FireOS
 - Support for the browser platform
 - Ability to configure icon and color on Android
 - Allow app to move to foreground on Android
 - Allow app to move to background on Android
 - Allow app to override back button behaviour on Android
 - New events for when the mode has been enabled/disabled
- __Improvements__
 - Various enhancements and bug fixes for all platforms
 - Support for latest platform and OS versions
 - Multi line text on Android
 - Multiple listeners for same event
 - Compatibility with cordova-plugin-geolocation
 - Compatibility with cordova-plugin-crosswalk-webview
 - Compatibility with cordova-plugin-wkwebview-engine
 - New sample app
- __Fixes__
 - Silent mode issues on Android
 - Lock screen issues on Android
 - Callback not called on Android  
 - Notification shows app info with cordova-android@6
 - Other apps audio interruption on iOS
- __Changes__
 - Deprecate event callbacks
 - Notification not visible by default on lock screen
 - Remove ticker property on Android
 - Remove unexpected back button handler
 - Remove support for wp8 platform

#### Version 0.6.5 (29.02.2016)
- Published on npm
- Updated dependency ID for the device plug-in

#### Version 0.6.4 (03.03.2015)
- Resolve possibly dependency conflict

#### Version 0.6.3 (01.01.2015)
- [feature:] Silent mode for Android

#### Version 0.6.2 (14.12.2014)
- [bugfix:] Type error
- [bugfix:] Wrong default values for `isEnabled` and `isActive`.

#### Version 0.6.1 (14.12.2014)
- [enhancement:] Set default settings through `setDefaults`.
- [enhancement:] New method `isEnabled` to receive if mode is enabled.
- [enhancement:] New method `isActive` to receive if mode is active.
- [bugfix:] Events caused thread collision.


#### Version 0.6.0 (14.12.2014)
- [feature:] Android support
- [feature:] Change Android notification through `configure`.
- [feature:] `onactivate`, `ondeactivate` and `onfailure` callbacks.
- [___change___:] Disabled by default
- [enhancement:] Get default settings through `getDefaults`.
- [enhancement:] iOS does not require user permissions, internet connection and geo location anymore.

#### Version 0.5.0 (13.02.2014)
- __retired__

#### Version 0.4.1 (13.02.2014)
- Release under the Apache 2.0 license.
- [enhancement:] Location tracking is only activated on WP8 if the location service is available.
- [bigfix:] Nullpointer exception on WP8.

#### Version 0.4.0 (10.10.2013)
- Added WP8 support<br>
  The plugin turns the app into an location tracking app *(for the time it runs in the background)*.

#### Version 0.2.1 (09.10.2013)
- Added js interface to manually enable/disable the background mode.

#### Version 0.2.0 (08.10.2013)
- Added iOS (>= 5) support<br>
  The plugin turns the app into an location tracking app for the time it runs in the background.
