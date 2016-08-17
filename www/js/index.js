/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        cordova.plugins.backgroundMode.setDefaults({ color: 'F26A33' });
        cordova.plugins.backgroundMode.onactivate = app.onModeActivated;
        cordova.plugins.backgroundMode.ondeactivate = app.onModeDeactivated;
        document.getElementById('silent').onclick = app.toggleSilent;
        document.getElementById('mode').onclick = app.toggleMode;
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    // Toggle the silent mode
    toggleSilent: function() {
        var el       = document.getElementById('silent'),
            isActive = app.toggleActive(el),
            plugin   = cordova.plugins.backgroundMode;

        plugin.setDefaults({ silent: isActive });
    },
    // Enable or disable the backgroud mode
    toggleMode: function() {
        var el       = document.getElementById('mode'),
            isActive = app.toggleActive(el),
            plugin   = cordova.plugins.backgroundMode;

        if (!isActive) {
            plugin.disable();
            return;
        }

        cordova.plugins.notification.badge
            .registerPermission(plugin.enable, plugin);
    },
    // Toggle 'active' CSS class and return new status
    toggleActive: function(el) {
        var isActive = el.className.indexOf('active') != -1;

        if (isActive) {
            el.className = el.className.replace(' active', '');
        } else {
            el.className += ' active';
        }

        return !isActive;
    },
    // To update the badge in intervals
    timer: null,
    // Update badge once mode gets activated
    onModeActivated: function() {
        var counter = 0;

        app.timer = setInterval(function () {
            counter++;

            console.log('Running since ' + counter + ' sec');

            cordova.plugins.notification.badge.set(counter);

            if (counter % 15 === 0) {
                cordova.plugins.backgroundMode.configure({
                    text: 'Running since ' + counter + ' sec'
                });
            }
        }, 1000);
    },
    // Reset badge once deactivated
    onModeDeactivated: function() {
        clearInterval(app.timer);
        cordova.plugins.notification.badge.clear();
    }
};

if (window.hasOwnProperty('Windows')) {
    alert = function (msg) { new Windows.UI.Popups.MessageDialog(msg).showAsync(); };
}

app.initialize();
