# Difference from [original repository](https://github.com/katzer/cordova-plugin-background-mode)
This repository is trying to solve issues with Windows compatibility of original plugin (mainly by finding workarounds for [issue #222](https://github.com/katzer/cordova-plugin-background-mode/issues/222)).
## Changes
1. Plugin hook to add windows capability `backgroundMediaPlayback` into windows `*.appxmanifest` files
1. Usage of `Windows.ApplicationModel.ExtendedExecution` functionality to keep app running when minimized
1. Starting audio playback automatically (to keep application running; quiet, but playing) - *might have performance & battery impact*
## Upsides
1. Plugin works for Windows applications (Desktop windows tested, haven't tested @mobile)
1. You can pause application background tasks by clicking pause button under application hover-preview in taskbar (side effect of being "media-app")
## Downsides
1. Windows target is not buildable by `[ionic] cordova build|run windows` (I suspect that this is another reminiscence of unsupported windows `backgroundMediaPlayback` capability in Cordova - framework validation of `*.appxmanifest` file fails)
1. When you're removing plugin, capability of `backgroundMediaPlayback` is kept in `*.appxmanifest` files, which means, that app is still not buildable by Cordova CLI (to fix it, remove/readd windows platform to project after plugin removal)
1. Possible severe performance issues/battery drains, because of continuous unstopped playback
