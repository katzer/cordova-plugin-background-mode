/*
    Copyright 2013-2017 appPlant GmbH

    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

var exec    = require('cordova/exec'),
    channel = require('cordova/channel');


/*************
 * INTERFACE *
 *************/

/**
 * Activates the background mode. When activated the application
 * will be prevented from going to sleep while in background
 * for the next time.
 */
exports.enable = function () {
    if (this.isEnabled())
        return;

    var fn = function () {
            exports._isEnabled = true;
            exports.fireEvent('enable');
        };

    cordova.exec(fn, null, 'BackgroundMode', 'enable', []);
};

/**
 * Deactivates the background mode. When deactivated the application
 * will not stay awake while in background.
 */
exports.disable = function () {
    if (!this.isEnabled())
        return;

    var fn = function () {
            exports._isEnabled = false;
            exports.fireEvent('disable');
        };

    cordova.exec(fn, null, 'BackgroundMode', 'disable', []);
};

/**
 * Enable or disable the background mode.
 *
 * @param [ Bool ] enable The status to set for.
 *
 * @return [ Void ]
 */
exports.setEnabled = function (enable) {
    if (enable) {
        this.enable();
    } else {
        this.disable();
    }
};

/**
 * List of all available options with their default value.
 *
 * @return {Object}
 */
exports.getDefaults = function () {
    return this._defaults;
};

/**
 * Overwrite default settings
 *
 * @param {Object} overrides
 *      Dict of options which shall be overridden
 */
exports.setDefaults = function (overrides) {
    var defaults = this.getDefaults();

    for (var key in defaults) {
        if (overrides.hasOwnProperty(key)) {
            defaults[key] = overrides[key];
        }
    }

    if (device.platform == 'Android') {
        cordova.exec(null, null, 'BackgroundMode', 'configure', [defaults, false]);
    }
};

/**
 * Configures the notification settings for Android.
 * Will be merged with the defaults.
 *
 * @param {Object} options
 *      Dict with key/value pairs
 */
exports.configure = function (options) {
    var settings = this.mergeWithDefaults(options);

    if (device.platform == 'Android') {
        cordova.exec(null, null, 'BackgroundMode', 'configure', [settings, true]);
    }
};

/**
 * Enable GPS-tracking in background (Android).
 */
exports.disableWebViewOptimizations = function () {
    if (device.platform == 'Android') {
        cordova.exec(null, null, 'BackgroundMode', 'disableWebViewOptimizations', []);
    }
};

/**
 * Move app to background (Android only).
 *
 * @return [ Void ]
 */
exports.moveToBackground = function () {
    if (device.platform == 'Android') {
        cordova.exec(null, null, 'BackgroundMode', 'background', []);
    }
};

/**
 * Move app to foreground when in background (Android only).
 *
 * @return [ Void ]
 */
exports.moveToForeground = function () {
    if (this.isActive() && device.platform == 'Android') {
        cordova.exec(null, null, 'BackgroundMode', 'foreground', []);
    }
};

/**
 * Override the back button on Android to go to background
 * instead of closing the app.
 *
 * @return [ Void ]
 */
exports.overrideBackButton = function () {
    document.addEventListener('backbutton', this.moveToBackground, false);
};

/**
 * If the mode is enabled or disabled.
 *
 * @return {Boolean}
 */
exports.isEnabled = function () {
    return this._isEnabled !== false;
};

/**
 * If the mode is active.
 *
 * @return {Boolean}
 */
exports.isActive = function () {
    return this._isActive !== false;
};


/**********
 * EVENTS *
 **********/

exports._listener = {};

/**
 * Fire event with given arguments.
 *
 * @param [ String ] event The event's name.
 * @param {args*} The callback's arguments.
 *
 * @return [ Void ]
 */
exports.fireEvent = function (event) {
    var args     = Array.apply(null, arguments).slice(1),
        listener = this._listener[event];

    if (!listener)
        return;

    for (var i = 0; i < listener.length; i++) {
        var fn    = listener[i][0],
            scope = listener[i][1];

        fn.apply(scope, args);
    }
};

/**
 * Register callback for given event.
 *
 * @param [ String ] event The event's name.
 * @param [ Function ] callback The function to be exec as callback.
 * @param [ Object ] scope The callback function's scope.
 *
 * @return [ Void ]
 */
exports.on = function (event, callback, scope) {

    if (typeof callback !== "function")
        return;

    if (!this._listener[event]) {
        this._listener[event] = [];
    }

    var item = [callback, scope || window];

    this._listener[event].push(item);
};

/**
 * Unregister callback for given event.
 *
 * @param [ String ] event The event's name.
 * @param [ Function ] callback The function to be exec as callback.
 *
 * @return [ Void ]
 */
exports.un = function (event, callback) {
    var listener = this._listener[event];

    if (!listener)
        return;

    for (var i = 0; i < listener.length; i++) {
        var fn = listener[i][0];

        if (fn == callback) {
            listener.splice(i, 1);
            break;
        }
    }
};

/**
 * @deprecated
 *
 * Called when the background mode has been activated.
 */
exports.onactivate = function () {};

/**
 * @deprecated
 *
 * Called when the background mode has been deaktivated.
 */
exports.ondeactivate = function () {};

/**
 * @deprecated
 *
 * Called when the background mode could not been activated.
 *
 * @param {Integer} errorCode
 *      Error code which describes the error
 */
exports.onfailure = function () {};


/*********
 * UTILS *
 *********/

/**
 * @private
 *
 * Merge settings with default values.
 *
 * @param {Object} options
 *      The custom options
 *
 * @return {Object}
 *      Default values merged
 *      with custom values
 */
exports.mergeWithDefaults = function (options) {
    var defaults = this.getDefaults();

    for (var key in defaults) {
        if (!options.hasOwnProperty(key)) {
            options[key] = defaults[key];
            continue;
        }
    }

    return options;
};


/***********
 * PRIVATE *
 ***********/

/**
 * @private
 *
 * Flag indicates if the mode is enabled.
 */
exports._isEnabled = window.webkit !== undefined;

/**
 * @private
 *
 * Flag indicates if the mode is active.
 */
exports._isActive = false;

/**
 * @private
 *
 * Default values of all available options.
 */
exports._defaults = {
    title:   'App is running in background',
    text:    'Doing heavy tasks.',
    ticker:  'Running in background',
    bigText: false,
    resume:  true,
    silent:  false,
    color:   undefined,
    icon:    'icon'
};

// Called before 'deviceready' listener will be called
channel.onCordovaReady.subscribe(function () {
    channel.onCordovaInfoReady.subscribe(function () {
        exports.setDefaults({});
    });
});

// Called after 'deviceready' event
channel.deviceready.subscribe(function () {
    if (window.webkit && exports.isEnabled()) {
        exports.fireEvent('enable');
    }
});
