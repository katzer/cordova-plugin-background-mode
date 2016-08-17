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

package de.appplant.cordova.plugin.background;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import org.json.JSONObject;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Puts the service in a foreground state, where the system considers it to be
 * something the user is actively aware of and thus not a candidate for killing
 * when low on memory.
 */
public class ForegroundService extends Service {

    // Fixed ID for the 'foreground' notification
    public static final int NOTIFICATION_ID = -574543954;

    // Binder given to clients
    private final IBinder mBinder = new ForegroundBinder();

    // Partial wake lock to prevent the app from going to sleep when locked
    private PowerManager.WakeLock wakeLock;

    /**
     * Allow clients to call on to the service.
     */
    @Override
    public IBinder onBind (Intent intent) {
        return mBinder;
    }

    /**
     * Class used for the client Binder.  Because we know this service always
     * runs in the same process as its clients, we don't need to deal with IPC.
     */
    public class ForegroundBinder extends Binder {
        ForegroundService getService() {
            // Return this instance of ForegroundService
            // so clients can call public methods
            return ForegroundService.this;
        }
    }

    /**
     * Put the service in a foreground state to prevent app from being killed
     * by the OS.
     */
    @Override
    public void onCreate () {
        super.onCreate();
        keepAwake();
    }

    /**
     * No need to run headless on destroy.
     */
    @Override
    public void onDestroy() {
        super.onDestroy();
        sleepWell();
    }

    /**
     * Put the service in a foreground state to prevent app from being killed
     * by the OS.
     */
    private void keepAwake() {
        JSONObject settings = BackgroundMode.getSettings();
        boolean isSilent    = settings.optBoolean("silent", false);

        if (!isSilent) {
            startForeground(NOTIFICATION_ID, makeNotification());
        }

        PowerManager powerMgr = (PowerManager)
                getSystemService(POWER_SERVICE);

        wakeLock = powerMgr.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK, "BackgroundMode");

        wakeLock.acquire();
    }

    /**
     * Stop background mode.
     */
    private void sleepWell() {
        stopForeground(true);

        if (wakeLock != null) {
            wakeLock.release();
            wakeLock = null;
        }
    }

    /**
     * Create a notification as the visible part to be able to put the service
     * in a foreground state by using the default settings.
     *
     * @return
     *      A local ongoing notification which pending intent is bound to the
     *      main activity.
     */
    private Notification makeNotification() {
        return makeNotification(BackgroundMode.getSettings());
    }

    /**
     * Create a notification as the visible part to be able to put the service
     * in a foreground state.
     *
     * @param settings
     *      The config settings
     *
     * @return
     *      A local ongoing notification which pending intent is bound to the
     *      main activity.
     */
    private Notification makeNotification(JSONObject settings) {
        Context context = getApplicationContext();
        String pkgName  = context.getPackageName();
        Intent intent   = context.getPackageManager()
                .getLaunchIntentForPackage(pkgName);

        Notification.Builder notification = new Notification.Builder(context)
                .setContentTitle(settings.optString("title", ""))
                .setContentText(settings.optString("text", ""))
                .setTicker(settings.optString("ticker", ""))
                .setOngoing(true)
                .setSmallIcon(getIconResId());

        setColor(notification, settings);

        if (intent != null && settings.optBoolean("resume")) {
            PendingIntent contentIntent = PendingIntent.getActivity(
                    context, NOTIFICATION_ID, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT);

            notification.setContentIntent(contentIntent);
        }

        return notification.build();
    }

    /**
     * Update the notification.
     *
     * @param settings
     *      The config settings
     */
    protected void updateNotification (JSONObject settings) {
        boolean isSilent = settings.optBoolean("silent", false);

        if (isSilent) {
            stopForeground(true);
            return;
        }

        Notification notification   = makeNotification(settings);
        NotificationManager service = (NotificationManager)
                getSystemService(Context.NOTIFICATION_SERVICE);

        service.notify(NOTIFICATION_ID, notification);
    }

    /**
     * Retrieves the resource ID of the app icon.
     *
     * @return
     *      The resource ID of the app icon
     */
    private int getIconResId() {
        JSONObject settings = BackgroundMode.getSettings();
        Context context = getApplicationContext();
        Resources res   = context.getResources();
        String pkgName  = context.getPackageName();
        String icon     = settings.optString("icon", "icon");

        int resId = res.getIdentifier(icon, "drawable", pkgName);

        if (resId == 0) {
            resId = res.getIdentifier("icon", "drawable", pkgName);
        }

        return resId;
    }

    /**
     * Set notification color if its supported by the SDK.
     *
     * @param notification
     *      A Notification.Builder instance
     * @param settings
     *      A JSON dict containing the color definition (red: FF0000)
     */
    private void setColor(Notification.Builder notification,
                          JSONObject settings) {

        String hex = settings.optString("color", null);

        if (Build.VERSION.SDK_INT < 21 || hex == null)
            return;

        int aRGB = Integer.parseInt(hex, 16) + 0xFF000000;

        try {
            Method setColorMethod = notification.getClass().getMethod(
                    "setColor", int.class);

            setColorMethod.invoke(notification, aRGB);
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }
}
