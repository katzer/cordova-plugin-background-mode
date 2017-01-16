/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var isPhone = (cordova.platformId == 'windows') && WinJS.Utilities.isPhone;
var isWp81 = navigator.appVersion.indexOf("Windows Phone 8.1") !== -1;
var isWp10 = navigator.appVersion.indexOf("Windows Phone 10") !== -1;
var isWin10UWP = navigator.appVersion.indexOf('MSAppHost/3.0') !== -1;
var isHosted = window.location.protocol.indexOf('http') === 0;
var splashImageSrc = ((isHosted || isWin10UWP) ? 'ms-appx-web' : 'ms-appx') + ':///images/'
    + (isPhone ? 'splashscreenphone.png' : 'splashscreen.png');

var splashElement = null, extendedSplashImage = null, extendedSplashProgress = null;

//// <Config and initialization>
var DEFAULT_SPLASHSCREEN_DURATION = 3000, // in milliseconds
    DEFAULT_FADE_DURATION = 500, // in milliseconds
    FPS = 60, // frames per second used by requestAnimationFrame
    PROGRESSRING_HEIGHT = 40,
    PROGRESSRING_BOTTOM_MARGIN = 10; // needed for windows 10 min height window

var bgColor = "#464646",
    autoHideSplashScreen = true,
    splashScreenDelay = DEFAULT_SPLASHSCREEN_DURATION,
    fadeSplashScreen = true,
    fadeSplashScreenDuration = DEFAULT_FADE_DURATION,
    showSplashScreenSpinner = true,
    splashScreenSpinnerColor; // defaults to system accent color

var effectiveSplashDuration;

function readBoolFromCfg(preferenceName, defaultValue, cfg) {
    var value = cfg.getPreferenceValue(preferenceName);
    if (typeof value !== 'undefined') {
        return value === 'true';
    } else {
        return defaultValue;
    }
}

function readPreferencesFromCfg(cfg) {
    try {
        bgColor = cfg.getPreferenceValue('SplashScreenBackgroundColor') || bgColor;
        bgColor = bgColor.replace('0x', '#').replace('0X', '#');
        if (bgColor.length > 7) {
            // Remove aplha
            bgColor = bgColor.slice(0, 1) + bgColor.slice(3, bgColor.length);
        }

        autoHideSplashScreen = readBoolFromCfg('AutoHideSplashScreen', autoHideSplashScreen, cfg);
        splashScreenDelay = cfg.getPreferenceValue('SplashScreenDelay') || splashScreenDelay;

        fadeSplashScreen = readBoolFromCfg('FadeSplashScreen', fadeSplashScreen, cfg);
        fadeSplashScreenDuration = cfg.getPreferenceValue('FadeSplashScreenDuration') || fadeSplashScreenDuration;

        showSplashScreenSpinner = readBoolFromCfg('ShowSplashScreenSpinner', showSplashScreenSpinner, cfg);
        splashScreenSpinnerColor = cfg.getPreferenceValue('SplashScreenSpinnerColor');

        effectiveSplashDuration = Math.max(splashScreenDelay - fadeSplashScreenDuration, 0);
    } catch (e) {
        var msg = '[Windows][SplashScreen] Error occured on loading preferences from config.xml: ' + JSON.stringify(e);
        console.error(msg);
    }
}

function isPortrait() {
    return window.innerHeight > window.innerWidth;
}

// Shift down the image to be vertical centered
function centerY() {
    if (isPortrait()) {
        if (window.screen.deviceYDPI === 172) { // 720p 4.7"
            extendedSplashImage.style.transform = "translateY(22px)";
        } else if (window.screen.deviceYDPI === 230) { // 1080p 5.5"
            extendedSplashImage.style.transform = "translateY(25px)";
        } else if (window.screen.deviceYDPI === 211) { // 1080p 6"
            extendedSplashImage.style.transform = "translateY(27px)";
        }
    } else {
        extendedSplashImage.style.transform = "";
    }
}

function init(config) {
    readPreferencesFromCfg(config);

    var splashscreenStyles = document.createElement("link");
    splashscreenStyles.rel = 'stylesheet';
    splashscreenStyles.type = 'text/css';
    splashscreenStyles.href = '/www/css/splashscreen.css';
    document.head.appendChild(splashscreenStyles);

    // Windows 8.1 Desktop
    //<div id='extendedSplashScreen' class='extendedSplashScreen hidden'>
    //    <img id='extendedSplashImage' src='/images/SplashScreen.png' alt='Splash screen image' />
    //    <progress id='extendedSplashProgress' class='win-medium win-ring'></progress>
    //</div>
    splashElement = document.createElement('div');
    splashElement.id = 'extendedSplashScreen';
    splashElement.classList.add('extendedSplashScreen');
    splashElement.classList.add('hidden');
    splashElement.style.backgroundColor = bgColor;

    extendedSplashImage = document.createElement('img');
    extendedSplashImage.id = 'extendedSplashImage';
    extendedSplashImage.alt = 'Splash screen image';

    // Disabling image drag
    var draggableAttr = document.createAttribute('draggable');
    draggableAttr.value = 'false';
    extendedSplashImage.attributes.setNamedItem(draggableAttr);

    extendedSplashImage.style.left = '0px';

    // This helps prevent flickering by making the system wait until your image has been rendered 
    // before it switches to your extended splash screen.
    var onloadAttr = document.createAttribute('onload');
    onloadAttr.value = '';
    extendedSplashImage.attributes.setNamedItem(onloadAttr);
    extendedSplashImage.src = splashImageSrc;

    extendedSplashProgress = document.createElement('progress');
    extendedSplashProgress.id = 'extendedSplashProgress';
    extendedSplashProgress.classList.add('win-medium');
    extendedSplashProgress.classList.add('win-ring');

    if (isWp81 || isWp10) {
        extendedSplashImage.style.maxWidth = "100%";
        extendedSplashImage.style.maxHeight = "100%";
        extendedSplashImage.src = splashImageSrc;
        // center horizontally
        extendedSplashImage.style.margin = "0 auto";
        extendedSplashImage.style.display = "block";
        // center vertically
        extendedSplashImage.style.position = "relative";
        extendedSplashImage.style.top = "50%";

        // Workaround for intial splashimage jump
        if (isWp10) {
            extendedSplashImage.style.transform = "translateY(-50%)";
        } else {
            centerY();
        }
    }

    if (isWp81) {
        extendedSplashProgress.classList.add('extended-splash-progress-phone');
    } else if (isWp10) {   
        extendedSplashProgress.classList.add('extended-splash-progress-wp10');
    }

    if (!showSplashScreenSpinner) {
        extendedSplashProgress.classList.add('hidden');
    }
    if (typeof splashScreenSpinnerColor !== 'undefined') {
        extendedSplashProgress.style.color = splashScreenSpinnerColor;
    }

    splashElement.appendChild(extendedSplashImage);
    splashElement.appendChild(extendedSplashProgress);

    document.body.appendChild(splashElement);
}
//// </Config and initialization>

//// <UI>
var origOverflow, origZooming;

function disableUserInteraction() {
    origOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    origZooming = document.body.style['-ms-content-zooming'];
    document.body.style['-ms-content-zooming'] = 'none';
}

function enableUserInteraction() {
    document.documentElement.style.overflow = origOverflow;
    document.body.style['-ms-content-zooming'] = origZooming;
}

// Displays the extended splash screen. Pass the splash screen object retrieved during activation.
function show() {
    disableUserInteraction();

    positionControls();

    // Once the extended splash screen is setup, apply the CSS style that will make the extended splash screen visible.
    WinJS.Utilities.removeClass(extendedSplashScreen, 'hidden');
}

function positionControls() {
    if (isWp10) {
        // Resize happens twice sometimes, ensure the image is properly positioned
        if (splash.imageLocation.y !== 0) {
            if (isPortrait()) {
                extendedSplashProgress.style.top = window.innerHeight * (2/3 + 1/6) - PROGRESSRING_HEIGHT / 2 + 'px';
            } else {
                extendedSplashProgress.style.top = Math.min(window.innerHeight - PROGRESSRING_HEIGHT - PROGRESSRING_BOTTOM_MARGIN, splash.imageLocation.y + splash.imageLocation.height + 32) + 'px';
            }
        }
        return;
    }

    // Position the extended splash screen image in the same location as the system splash screen image.
    if (isPhone) {
        extendedSplashImage.style.top = 0;
        extendedSplashImage.style.left = 0;
        centerY();
    } else {
        extendedSplashImage.style.top = splash.imageLocation.y + 'px';
        extendedSplashImage.style.left = splash.imageLocation.x + 'px';
    }

    if (!isWp81) {
        extendedSplashImage.style.height = splash.imageLocation.height + 'px';
        extendedSplashImage.style.width = splash.imageLocation.width + 'px';

        extendedSplashProgress.style.marginTop = Math.min(window.innerHeight - PROGRESSRING_HEIGHT - PROGRESSRING_BOTTOM_MARGIN, splash.imageLocation.y + splash.imageLocation.height + 32) + 'px';
    }
}

// Updates the location of the extended splash screen image. Should be used to respond to window size changes.
function updateImageLocation() {
    if (isVisible()) {
        positionControls();
    }
}

// Checks whether the extended splash screen is visible and returns a boolean.
function isVisible() {
    return !(WinJS.Utilities.hasClass(extendedSplashScreen, 'hidden'));
}

function fadeOut(el, duration, finishCb) {
    var opacityDelta = 1 / (FPS * duration / 1000);
    el.style.opacity = 1;

    (function fade() {
        if ((el.style.opacity -= opacityDelta) < 0) {
            finishCb();
        } else {
            requestAnimationFrame(fade);
        }
    })();
}

// Removes the extended splash screen if it is currently visible.
function hide() {
    if (isVisible()) {
        var hideFinishCb = function () {
            WinJS.Utilities.addClass(extendedSplashScreen, 'hidden');
            extendedSplashScreen.style.opacity = 1;
            enableUserInteraction();
        }

        if (fadeSplashScreen) {
            fadeOut(extendedSplashScreen, fadeSplashScreenDuration, hideFinishCb);
        } else {
            hideFinishCb();
        }
    }
}
//// </UI>

//// <Events>
var splash = null; // Variable to hold the splash screen object. 
var coordinates = { x: 0, y: 0, width: 0, height: 0 }; // Object to store splash screen image coordinates. It will be initialized during activation. 

function activated(eventObject) {
    // Retrieve splash screen object 
    splash = eventObject.detail.splashScreen;

    // Retrieve the window coordinates of the splash screen image. 
    coordinates = splash.imageLocation;

    // Register an event handler to be executed when the splash screen has been dismissed. 
    splash.addEventListener('dismissed', onSplashScreenDismissed, false);

    // Listen for window resize events to reposition the extended splash screen image accordingly. 
    // This is important to ensure that the extended splash screen is formatted properly in response to snapping, unsnapping, rotation, etc... 
    window.addEventListener('resize', onResize, false);
}

function onSplashScreenDismissed() {
    // Include code to be executed when the system has transitioned from the splash screen to the extended splash screen (application's first view). 
    if (autoHideSplashScreen) {
        window.setTimeout(hide, effectiveSplashDuration);
    }
}

function onResize() {
    // Safely update the extended splash screen image coordinates. This function will be fired in response to snapping, unsnapping, rotation, etc... 
    if (splash) {
        // Update the coordinates of the splash screen image. 
        coordinates = splash.imageLocation;
        updateImageLocation(splash);
    }
}
//// </Events>

module.exports = {
    firstShow: function (config, activatedEventArgs) {
        init(config);
        activated(activatedEventArgs);

        if (!isVisible() && (splashScreenDelay > 0 || !autoHideSplashScreen)) {
            show();
        }
    },
    show: function () {
        if (!isVisible()) {
            show();
        }
    },
    hide: function () {
        if (isVisible()) {
            hide();
        }
    }
};
