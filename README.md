
Cordova Background Plug-in - Example
====================================

[Cordova][cordova] plugin to prevent the app from going to sleep while in background.

## Instructions
[Download][zip] or clone the _example_ branch and run the following command:

```bash
cordova run [ios|android|wp8]
```

These will lunch the simulator or any plugged in device and start the example application as seen below in the screenshots.
Its also possible to open the project with [Xcode][xcode], [Android Studio][studio] or [Eclipse][eclipse].

<p align="center">
    <img src="images/overview.png"></img>
</p>

A click on the _"Enable Mode"_ button will prevent the app from going to sleep in background. Once activated the app starts increasing its badge number and writing a log every second.

```javascript
// Prevent the app from going to sleep in background
cordova.plugins.backgroundMode.enable();

// Get informed when the background mode has been activated
cordova.plugins.backgroundMode.onactivate = function () {
    var counter = 0;

    // Update badge number every second
    // and write update to log
    timer = setInterval(function () {
        counter++;
        console.log('Running since ' + counter + ' sec');
        cordova.plugins.notification.badge.set(counter);
    }, 1000);
};

// Get informed when the background mode has been deactivated
cordova.plugins.backgroundMode.ondeactivate = function () {
    clearInterval(timer);
    cordova.plugins.notification.badge.clear();
};
```

Please read the plugin's [README][readme] for further requirements and informations.


## Android notification
To indicate that the app is executing tasks in background - and being paused would disrupt the user - the plug-in has to create a notification while in background on Android.

The default configuration can be changed with `setDefaults` or through `configure` to update the currently displayed notification only.

<p align="center">
    <img src="images/android.png"></img>
</p>


## License

This software is released under the [Apache 2.0 License][apache2_license].

© 2013-2014 appPlant UG, Inc. All rights reserved


[cordova]: https://cordova.apache.org
[readme]: https://github.com/katzer/cordova-plugin-background-mode/blob/master/README.md
[zip]: https://github.com/katzer/cordova-plugin-background-mode/archive/example.zip
[xcode]: https://developer.apple.com/xcode/
[studio]: https://developer.android.com/sdk/installing/studio.html
[eclipse]: https://developer.android.com/sdk/index.html
[apache2_license]: http://opensource.org/licenses/Apache-2.0
