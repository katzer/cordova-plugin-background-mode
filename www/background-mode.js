/**
 *  background-mode.js
 *  Cordova Background-Mode Plugin
 *
 *  Created by Sebastian Katzer (github.com/katzer) on 09/10/2013.
 *  Copyright 2013 Sebastian Katzer. All rights reserved.
 *  GPL v2 licensed
 */

var BackgroundMode = function () {

};

BackgroundMode.prototype = {
    /**
     * Aktiviert den Hintergrundmodus.
     */
    activate: function () {
        cordova.exec(null, null, 'BackgroundMode', 'activate', []);
    },

    /**
     * Deaktiviert den Hintergrundmodus
     */
    deactivate: function (badge) {
        cordova.exec(null, null, 'BackgroundMode', 'deactivate', []);
    }
};

var plugin = new BackgroundMode();

module.exports = plugin;