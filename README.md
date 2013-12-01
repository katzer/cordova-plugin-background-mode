Cordova BackgroundMode-Plugin
==============================

A bunch of background mode plugins for Cordova 3.x.x

by Sebastián Katzer ([github.com/katzer](https://github.com/katzer))

## Supported Platforms
- **iOS** (>=5)
- **WP8**

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

## Quirks

### The app crashes under iOS
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

### Location tracking under iOS
**iOS 5-6**<br>
The app still runs in background, even if the location service is not actived.

**iOS 7**<br>
The location service needs to be enabled.

### Optimization under WP8
By default the plugin will track for geo updates while the application is in background and foreground. To stop tracking in foreground, the `MainPage.xaml.cs` file needs the following 2 methods:
```c#
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

### TypeError: Cannot read property 'currentVersion' of null
Along with Cordova 3.2 and Windows Phone 8 the `version.bat` script has to be renamed to `version`.

On Mac or Linux
```
mv platforms/wp8/cordova/version.bat platforms/wp8/cordova/version
```
On Windows
```
ren platforms\wp8\cordova\version.bat platforms\wp8\cordova\version
```
