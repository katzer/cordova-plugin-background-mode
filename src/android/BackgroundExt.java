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

package de.appplant.cordova.plugin.background;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.ActivityManager.AppTask;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.view.View;
import android.view.Window;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;

import java.lang.ref.WeakReference;
import java.util.List;

import static android.content.Context.ACTIVITY_SERVICE;
import static android.content.Context.POWER_SERVICE;
import static android.view.WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON;
import static android.view.WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD;
import static android.view.WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED;
import static android.view.WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON;

class BackgroundExt {

    // Weak reference to the cordova interface passed by the plugin
    private final WeakReference<CordovaInterface> cordova;

    // Weak reference to the cordova web view passed by the plugin
    private final WeakReference<CordovaWebView> webView;

    private PowerManager.WakeLock wakeLock;

    /**
     * Initialize the extension to perform non-background related tasks.
     *
     * @param plugin The cordova plugin.
     */
    private BackgroundExt(CordovaPlugin plugin) {
        this.cordova = new WeakReference<CordovaInterface>(plugin.cordova);
        this.webView = new WeakReference<CordovaWebView>(plugin.webView);
    }

    /**
     * Executes the request asynchronous.
     *
     * @param plugin   The cordova plugin.
     * @param action   The action to execute.
     * @param callback The callback context used when
     *                 calling back into JavaScript.
     */
    @SuppressWarnings("UnusedParameters")
    static void execute (CordovaPlugin plugin, final String action,
                         final CallbackContext callback) {

        final BackgroundExt ext = new BackgroundExt(plugin);

        plugin.cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                ext.execute(action, callback);
            }
        });
    }

    // codebeat:disable[ABC]

    /**
     * Executes the request.
     *
     * @param action   The action to execute.
     * @param callback The callback context used when
     *                 calling back into JavaScript.
     */
    private void execute (String action, CallbackContext callback) {

        if (action.equalsIgnoreCase("optimizations")) {
            disableWebViewOptimizations();
        }

        if (action.equalsIgnoreCase("background")) {
            moveToBackground();
        }

        if (action.equalsIgnoreCase("foreground")) {
            moveToForeground();
        }

        if (action.equalsIgnoreCase("tasklist")) {
            excludeFromTaskList();
        }

        if (action.equalsIgnoreCase("dimmed")) {
            isDimmed(callback);
        }

        if (action.equalsIgnoreCase("wakeup")) {
            wakeup();
        }

        if (action.equalsIgnoreCase("unlock")) {
            wakeup();
            unlock();
        }
    }

    // codebeat:enable[ABC]

    /**
     * Move app to background.
     */
    private void moveToBackground() {
        Intent intent = new Intent(Intent.ACTION_MAIN);

        intent.addCategory(Intent.CATEGORY_HOME);
        getApp().startActivity(intent);
    }

    /**
     * Move app to foreground.
     */
    private void moveToForeground() {
        Activity  app = getApp();
        Intent intent = getLaunchIntent();

        intent.addFlags(
                Intent.FLAG_ACTIVITY_REORDER_TO_FRONT |
                Intent.FLAG_ACTIVITY_SINGLE_TOP);

        app.startActivity(intent);
    }

    /**
     * Enable GPS position tracking while in background.
     */
    private void disableWebViewOptimizations() {
        Thread thread = new Thread(){
            public void run() {
                try {
                    Thread.sleep(1000);
                    getApp().runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            View view = webView.get().getEngine().getView();

                            try {
                                Class.forName("org.crosswalk.engine.XWalkCordovaView")
                                        .getMethod("onShow")
                                        .invoke(view);
                            } catch (Exception e){
                                view.dispatchWindowVisibilityChanged(View.VISIBLE);
                            }
                        }
                    });
                } catch (InterruptedException e) {
                    // do nothing
                }
            }
        };

        thread.start();
    }

    /**
     * Exclude the app from the recent tasks list.
     */
    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    private void excludeFromTaskList() {
        ActivityManager am = (ActivityManager) getService(ACTIVITY_SERVICE);

        if (am == null || Build.VERSION.SDK_INT < 21)
            return;

        List<AppTask> tasks = am.getAppTasks();

        if (tasks == null || tasks.isEmpty())
            return;

        tasks.get(0).setExcludeFromRecents(true);
    }

    /**
     * Invoke the callback with information if the screen is on.
     *
     * @param callback The callback to invoke.
     */
    @SuppressWarnings("deprecation")
    private void isDimmed(CallbackContext callback) {
        PluginResult result = new PluginResult(Status.OK, isDimmed());
        callback.sendPluginResult(result);
    }

    /**
     * If the screen is active.
     */
    @SuppressWarnings("deprecation")
    private boolean isDimmed() {
        PowerManager pm = (PowerManager) getService(POWER_SERVICE);

        if (Build.VERSION.SDK_INT < 20) {
            return !pm.isScreenOn();
        }

        return !pm.isInteractive();
    }

    /**
     * Wakes up the device if the screen isn't still on.
     */
    private void wakeup() {
        try {
            acquireWakeLock();
        } catch (Exception e) {
            releaseWakeLock();
        }
    }

    /**
     * Unlocks the device even with password protection.
     */
    private void unlock() {
        Intent intent  = getLaunchIntent();
        getApp().startActivity(intent);
    }

    /**
     * Acquire a wake lock to wake up the device.
     */
    private void acquireWakeLock() {
        PowerManager pm = (PowerManager) getService(POWER_SERVICE);

        releaseWakeLock();

        if (!isDimmed()) {
            return;
        }

        int level = PowerManager.SCREEN_DIM_WAKE_LOCK |
                    PowerManager.ACQUIRE_CAUSES_WAKEUP;

        wakeLock = pm.newWakeLock(level, "BackgroundModeExt");
        wakeLock.setReferenceCounted(false);
        wakeLock.acquire(1000);
    }

    /**
     * Releases the previously acquire wake lock.
     */
    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            wakeLock = null;
        }
    }

    /**
     * Add required flags to the window to unlock/wakeup the device.
     */
    static void addWindowFlags(Activity app) {
        final Window window = app.getWindow();

        app.runOnUiThread(new Runnable() {
            public void run() {
                window.addFlags(
                        FLAG_ALLOW_LOCK_WHILE_SCREEN_ON |
                        FLAG_SHOW_WHEN_LOCKED |
                        FLAG_TURN_SCREEN_ON |
                        FLAG_DISMISS_KEYGUARD
                );
            }
        });
    }

    /**
     * The activity referenced by cordova.
     *
     * @return The main activity of the app.
     */
    Activity getApp() {
        return cordova.get().getActivity();
    }

    /**
     * The launch intent for the main activity.
     */
    private Intent getLaunchIntent() {
        Context app    = getApp().getApplicationContext();
        String pkgName = app.getPackageName();

        return app.getPackageManager().getLaunchIntentForPackage(pkgName);
    }

    /**
     * Get the requested system service by name.
     *
     * @param name The name of the service.
     *
     * @return The service instance.
     */
    private Object getService(String name) {
        return getApp().getSystemService(name);
    }

}
