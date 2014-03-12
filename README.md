Cordova BackgroundMode-Plugin
==============================

A bunch of background mode plugins for Cordova 3.x.x

by Sebastián Katzer ([github.com/katzer](https://github.com/katzer))


## Supported Platforms
- **iOS** (>=5)
- **Android**
- **WP8**


## Adding the Plugin to your project
Through the [Command-line Interface](http://cordova.apache.org/docs/en/3.0.0/guide_cli_index.md.html#The%20Command-line%20Interface):
```bash
# from master:
cordova plugin add https://github.com/katzer/cordova-plugin-background-mode.git
cordova build

# last version:
cordova plugin add de.appplant.cordova.plugin.background-mode
cordova build
```


## Removing the Plugin from your project
Through the [Command-line Interface](http://cordova.apache.org/docs/en/3.0.0/guide_cli_index.md.html#The%20Command-line%20Interface):
```
cordova plugin rm de.appplant.cordova.plugin.background-mode
```


## PhoneGap Build
Add the following xml to your config.xml to always use the latest version of this plugin:
```
<gap:plugin name="de.appplant.cordova.plugin.background-mode" />
```
or to use this exact version:
```
<gap:plugin name="de.appplant.cordova.plugin.background-mode" version="0.5.0" />
```
More informations can be found [here](https://build.phonegap.com/plugins/490).


## Release Notes
#### Version 0.5.0 (13.02.2014)
- Added Android support.

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

## Using the plugin
Simply add the plugin to your project and the app will run while in background.

The plugin creates the object ```window.plugin.backgroundMode``` with two methods:

### enable()
The method enables the background mode. The mode is activated once the app has entered the background and will be deactivated after the app has entered the foreground.<br>
Please be aware, to activate the background mode the app needs to be in foreground.

```javascript
/**
 * Enables the background mode. The app will not pause while in background.
 */
window.plugin.backgroundMode.enable();
```

### disable()
The method disables the background mode. If the mode is disabled while the app is running in the background, the app will be paused immediately.
```javascript
/**
 * Disables the background mode. The app will pause in background as usual.
 */
window.plugin.backgroundMode.disable();
```

## Platform specifics

### Location tracking on iOS
**iOS 5-6**<br>
The app still runs in background, even if the location service is not actived.

**iOS 7**<br>
The location service needs to be enabled.

**AppStore**<br>
Warning: if you use this plugin but your app does not require any persistent geolocation (eg you do nothing with the geolocation values), your app will be rejected by the AppStore review team (there is at least one predecedent).

### Optimization on WP8
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

### The app crashes on iOS
If the app crashes after installing the plugin, make sure that your `*-Info.plist` is valid.
Do to some bugs in cordova or Plugman please reset all occurences like
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

### TypeError: Cannot read property 'currentVersion' of null
The error occurs while trying to install the plugin from master. As a workaround the **version.bat** script has to be renamed to **version**.

On Mac or Linux
```
mv platforms/wp8/cordova/version.bat platforms/wp8/cordova/version
```
On Windows
```
ren platforms\wp8\cordova\version.bat platforms\wp8\cordova\version
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## License

This software is released under the [Apache 2.0 License](http://opensource.org/licenses/Apache-2.0).
