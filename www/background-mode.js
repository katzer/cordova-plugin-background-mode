/*
    Copyright 2013-2014 appPlant UG

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


// Override back button action to prevent being killed
document.addEventListener('backbutton', function () {}, false);

channel.deviceready.subscribe(function () {
    // Set the current settings
    exports.configure();

    // Only enable WP8 by default
    if (['WinCE', 'Win32NT'].indexOf(device.platform) > -1) {
        exports.enable();
    }
});


/**
 * List of all available options with their current value.
 */
exports.currentOptions = (
    {
        title:  'App is running in background',
        text:   'Doing heavy tasks.',
        ticker: 'App is running in background',
        resume: true
    }
);

/**
 * Activates the background mode. When activated the application
 * will be prevented from going to sleep while in background
 * for the next time.
 */
exports.enable = function () {
    cordova.exec(null, null, 'BackgroundMode', 'enable', []);
};

/**
 * Deactivates the background mode. When deactivated the application
 * will not stay awake while in background.
 */
exports.disable = function () {
    cordova.exec(null, null, 'BackgroundMode', 'disable', []);
};

/**
 * Configures the notification settings for Android.
 * Will be merged with the current.
 *
 * @param {Object} options
 *      Dict with key/value pairs
 */
exports.configure = function (options) {
    var settings = this.mergeWithCurrent(options || {});

    if (device.platform == 'Android') {
        cordova.exec(null, null, 'BackgroundMode', 'configure', [settings]);
    }
};

/**
 * @private
 *
 * Merge settings with current values.
 *
 * @param {Object} options
 *      The custom options
 *
 * @return {Object}
 *      Current values merged
 *      with custom values
 */
exports.mergeWithCurrent = function (options) {

	
	for (var key in this.currentOptions) {
        if (options.hasOwnProperty(key)) {
            this.currentOptions[key] = options[key];
            continue;
        }
    }

    return this.currentOptions;
};
