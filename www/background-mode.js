/**
 *  background-mode.js
 *  Cordova Background-Mode Plugin
 *
 *  Created by Sebastian Katzer (github.com/katzer) on 09/10/2013.
 *  Copyright 2013 Sebastian Katzer. All rights reserved.
 *  GPL v2 licensed
 */

var BackgroundMode = function () {
    // Registriert die Listener für die (sleep/resume) Events
    cordova.exec(null, null, 'BackgroundMode', 'observeLifeCycle', []);
};

BackgroundMode.prototype = {
    /**
     * @public
     *
     * Aktiviert den Hintergrundmodus.
     */
    activate: function () {
        cordova.exec(null, null, 'BackgroundMode', 'activate', []);
    },

    /**
     * @public
     *
     * Deaktiviert den Hintergrundmodus
     */
    deactivate: function () {
        cordova.exec(null, null, 'BackgroundMode', 'deactivate', []);
    }
};

var plugin = new BackgroundMode();

module.exports = plugin;