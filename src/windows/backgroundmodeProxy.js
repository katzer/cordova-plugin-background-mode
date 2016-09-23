/**
 *  BackgroundMode plugin for Windows 10 Universal
 *
 *  Copyright (c) 2015 Next Wave Software, Inc.
**/
var backgroundMode = {
    extendedSession: null,
    settings: { text: "Background processing" },

    /**
     * Called internally to enable background execution.
     */
    requestExtendedExecution: function () {

        // Release the current active extended session if we have one.
        backgroundMode.releaseExtendedExecution();

        // Set up to request an extended session
        backgroundMode.extendedSession = new Windows.ApplicationModel.ExtendedExecution.ExtendedExecutionSession();
        backgroundMode.extendedSession.description = backgroundMode.settings.text;
        backgroundMode.extendedSession.reason = Windows.ApplicationModel.ExtendedExecution.ExtendedExecutionReason.unspecified;

        // When our app is running in the background and returns to the foreground, Windows will revoke our extended session permission.
        // This is normal, so just request another session.
        backgroundMode.extendedSession.onrevoked = function (args) {
            backgroundMode.requestExtendedExecution();
        };

        // Request the session
        backgroundMode.extendedSession.requestExtensionAsync().done(
            function success() {
                cordova.plugins.backgroundMode.onactivate();
            },
            function error(error) {
                cordova.plugins.backgroundMode.onfailure(0);
            }
        );
    },

    /**
     * Called internally to disable background execution.
     */
    releaseExtendedExecution: function () {

        if (backgroundMode.extendedSession != null) {
            backgroundMode.extendedSession.close();
            backgroundMode.extendedSession = null;
        }
    }
};

cordova.commandProxy.add("BackgroundMode", {

    /**
     * Enables background execution.
     */
    // exec(null, null, 'BackgroundMode', 'enable', []);
    enable: function () {

		// Whenever our app is launched, request permission to continue running in the background the next time Windows wants to suspend us.
		WinJS.Application.addEventListener("activated", function (args) {
			if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch)
			    backgroundMode.requestExtendedExecution();
		});
	
		// Whenever Windows tries to suspend us, again request permission to continue running in the background.
		WinJS.Application.addEventListener("checkpoint", function (args) {
		    backgroundMode.requestExtendedExecution();
		});
    },

    /**
     * Disables background execution.
     */
    // exec(null, null, 'BackgroundMode', 'disable', []);
    disable: function () {

        backgroundMode.releaseExtendedExecution();
		cordova.plugins.backgroundMode.ondeactivate();
    },

    /**
     * Sets configuration values.
     */
    // exec(null, null, 'BackgroundMode', 'configure', [settingsObject, isUpdate]);
    configure: function (args) {

        backgroundMode.settings = args[0];
    }
});