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

var plugin  = cordova.plugins.backgroundMode;

var Uri               = Windows.Foundation.Uri,
    MediaSource       = Windows.Media.Core.MediaSource,
    MediaPlaybackItem = Windows.Media.Playback.MediaPlaybackItem,
    MediaPlaybackList = Windows.Media.Playback.MediaPlaybackList,
    AudioCategory     = Windows.Media.Playback.MediaPlayerAudioCategory,
    MediaPlayer       = Windows.Media.Playback.MediaPlayer,
    WebUIApplication  = Windows.UI.WebUI.WebUIApplication;

/**
 * Activates the background mode. When activated the application
 * will be prevented from going to sleep while in background
 * for the next time.
 *
 * @param [ Function ] success The success callback to use.
 * @param [ Function ] error The error callback to use.
 *
 * @return [ Void ]
 */
exports.enable = function (success, error) {
    success();
};

/**
 * Deactivates the background mode. When deactivated the application
 * will not stay awake while in background.
 *
 * @param [ Function ] success The success callback to use.
 * @param [ Function ] error The error callback to use.
 *
 * @return [ Void ]
 */
exports.disable = function (success, error) {
    exports.stopKeepingAwake();
    success();
};

/**
 * Keep the app awake.
 *
 * @return [ Void ]
 */
exports.keepAwake = function () {
    if (!plugin.isEnabled() || plugin.isActive())
       return;

    exports.configureAudioPlayer();
    exports.audioPlayer.play();

    plugin._isActive = true;
    plugin.fireEvent('activate');
};

/**
 * Let the app going to sleep.
 *
 * @return [ Void ]
 */
exports.stopKeepingAwake = function () {
    if (!exports.audioPlayer)
        return;

    exports.audioPlayer.close();
    exports.audioPlayer = null;

    cordova.plugins.backgroundMode._isActive = false;
    cordova.plugins.backgroundMode.fireEvent('deactivate');
};

/**
 * Configure the audio player for playback in background.
 *
 * @return [ Void ]
 */
exports.configureAudioPlayer = function () {
    if (exports.audioPlayer)
        return;

    var pkg     = Windows.ApplicationModel.Package.current,
        pkgName = pkg.id.name;

    var audioPlayer = new MediaPlayer(),
        audioFile   = new Uri('ms-appx://' + pkgName + '/appbeep.wma'),
        audioSource = MediaSource.createFromUri(audioFile),
        playList    = new MediaPlaybackList();

        playList.items.append(new MediaPlaybackItem(audioSource));
        playList.autoRepeatEnabled = true;

        audioPlayer.source        = playList;
        audioPlayer.autoPlay      = false;
        audioPlayer.audioCategory = AudioCategory.soundEffects;
        audioPlayer.volume        = 0;

    exports.audioPlayer = audioPlayer;
};

WebUIApplication.addEventListener('enteredbackground', exports.keepAwake, false);
WebUIApplication.addEventListener('leavingbackground', exports.stopKeepingAwake, false);

cordova.commandProxy.add('BackgroundMode', exports);
