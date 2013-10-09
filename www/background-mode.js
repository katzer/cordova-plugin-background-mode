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
    enable: function () {
        cordova.exec(null, null, 'BackgroundMode', 'enable', []);
    },

    /**
     * @public
     *
     * Deaktiviert den Hintergrundmodus
     */
    disable: function () {
        cordova.exec(null, null, 'BackgroundMode', 'disable', []);
    }
};

var plugin = new BackgroundMode();

module.exports = plugin;