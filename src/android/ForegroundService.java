/*
 Copyright 2013 Sebastián Katzer

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

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.*;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.drawable.Icon;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import org.json.JSONObject;
import android.support.v4.app.NotificationCompat;

import static android.os.PowerManager.PARTIAL_WAKE_LOCK;

/**
 * Puts the service in a foreground state, where the system considers it to be
 * something the user is actively aware of and thus not a candidate for killing
 * when low on memory.
 */
public class ForegroundService extends Service {

    // Fixed ID for the 'foreground' notification
    public static final int NOTIFICATION_ID = -574543954;

    // Default title of the background notification
    private static final String NOTIFICATION_TITLE =
            "App is running in background";

    // Default text of the background notification
    private static final String NOTIFICATION_TEXT =
            "Doing heavy tasks.";

    // Default icon of the background notification
    private static final String NOTIFICATION_ICON = "icon";

    // Binder given to clients
    private final IBinder binder = new ForegroundBinder();

    // Partial wake lock to prevent the app from going to sleep when locked
    private PowerManager.WakeLock wakeLock;

    /**
     * Allow clients to call on to the service.
     */
    @Override
    public IBinder onBind (Intent intent) {
        return binder;
    }

    /**
     * Class used for the client Binder.  Because we know this service always
     * runs in the same process as its clients, we don't need to deal with IPC.
     */
    class ForegroundBinder extends Binder
    {
        ForegroundService getService()
        {
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
    public void onCreate()
    {
        super.onCreate();
        keepAwake();
    }

    /**
     * No need to run headless on destroy.
     */
    @Override
    public void onDestroy()
    {
        super.onDestroy();
        sleepWell();
    }

    /**
     * Prevent Android from stopping the background service automatically.
     */
    @Override
    public int onStartCommand (Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    /**
     * Put the service in a foreground state to prevent app from being killed
     * by the OS.
     */
    @SuppressLint("WakelockTimeout")
    private void keepAwake()
    {
        JSONObject settings = BackgroundMode.getSettings();
        boolean isSilent    = settings.optBoolean("silent", false);

        if (!isSilent) {
            startForeground(NOTIFICATION_ID, makeNotification());
        }

        PowerManager pm = (PowerManager)getSystemService(POWER_SERVICE);

        wakeLock = pm.newWakeLock(
                PARTIAL_WAKE_LOCK, "backgroundmode:wakelock");

        wakeLock.acquire();
    }

    /**
     * Stop background mode.
     */
    private void sleepWell()
    {
        stopForeground(true);
        getNotificationManager().cancel(NOTIFICATION_ID);

        if (wakeLock != null) {
            wakeLock.release();
            wakeLock = null;
        }
    }

    /**
     * Create a notification as the visible part to be able to put the service
     * in a foreground state by using the default settings.
     */
    private Notification makeNotification()
    {
        return makeNotification(BackgroundMode.getSettings());
    }

    /**
     * Create a notification as the visible part to be able to put the service
     * in a foreground state.
     *
     * @param settings The config settings
     */
    private Notification makeNotification (JSONObject settings)
    {
        // use channelid for Oreo and higher
        String CHANNEL_ID = "cordova-plugin-background-mode-id";
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // The user-visible name of the channel.
            CharSequence name = settings.optString("channelName", "cordova-plugin-background-mode");
            // The user-visible description of the channel.
            String description = settings.optString("channelDescription", "cordova-plugin-background-moden notification");

            int importance = NotificationManager.IMPORTANCE_LOW;

            NotificationChannel mChannel = new NotificationChannel(CHANNEL_ID, name, importance);

            // Configure the notification channel.
            mChannel.setDescription(description);

            getNotificationManager().createNotificationChannel(mChannel);
        }
        String title    = settings.optString("title", NOTIFICATION_TITLE);
        String text     = settings.optString("text", NOTIFICATION_TEXT);
        boolean bigText = settings.optBoolean("bigText", false);
        String subText = settings.optString("subText", "");
        String visibility = settings.optString("visibility", "");

        Context context = getApplicationContext();
        String pkgName  = context.getPackageName();
        Intent intent   = context.getPackageManager()
                .getLaunchIntentForPackage(pkgName);

        int smallIcon = getIconResId(settings);
        if (smallIcon == 0) { //If no icon at all was found, fall back to the app's icon
            smallIcon = context.getApplicationInfo().icon;
        }

        NotificationCompat.Builder notification = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(text)
                .setOngoing(true)
                .setSmallIcon(smallIcon)
                .setShowWhen(settings.optBoolean("showWhen", true));

        if (!subText.equals("")) {
            notification.setSubText(subText);
        }

        if (settings.optBoolean("allowClose", false)) {

            final Intent clostAppIntent = new Intent("com.backgroundmode.close" + pkgName);
            final PendingIntent closeIntent = PendingIntent.getBroadcast(context, 1337, clostAppIntent, 0);
            final String closeIconName = settings.optString("closeIcon", "power");
            NotificationCompat.Action.Builder closeAction = new NotificationCompat.Action.Builder(getIconResId(closeIconName), settings.optString("closeTitle", "Close"), closeIntent);
            notification.addAction(closeAction.build());
        }

        if (settings.optBoolean("hidden", true)) {
            notification.setPriority(Notification.PRIORITY_MIN);
        }

        if (bigText || text.contains("\n")) {
            notification.setStyle(
                    new NotificationCompat.BigTextStyle().bigText(text));
        }

        if (!visibility.equals("")) {
            notification.setVisibility(getVisibility(visibility));
        }

        setColor(notification, settings);

        if (intent != null && settings.optBoolean("resume")) {
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
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
     * @param settings The config settings
     */
    protected void updateNotification (JSONObject settings)
    {
        boolean isSilent = settings.optBoolean("silent", false);

        if (isSilent) {
            stopForeground(true);
            return;
        }

        Notification notification = makeNotification(settings);
        getNotificationManager().notify(NOTIFICATION_ID, notification);

    }

    /**
     * Retrieves the resource ID of the sent icon name
     *
     * @param name Name of the resource to return
     */
    private int getIconResId(String name) {
        int resId = getIconResId(name, "mipmap");

        if (resId == 0) {
            resId = getIconResId(name, "drawable");
        }

        if (resId == 0) {
            resId = getIconResId("icon", "mipmap");
        }

        if (resId == 0) {
            resId = getIconResId("icon", "drawable");
        }


        return resId;
    }

    /**
     * Retrieves the resource ID of the app icon.
     *
     * @param settings A JSON dict containing the icon name.
     */
    private int getIconResId(JSONObject settings) {
        String icon = settings.optString("icon", NOTIFICATION_ICON);

        return getIconResId(icon);
    }

    /**
     * Retrieve resource id of the specified icon.
     *
     * @param icon The name of the icon.
     * @param type The resource type where to look for.
     *
     * @return The resource id or 0 if not found.
     */
    private int getIconResId (String icon, String type)
    {
        Resources res  = getResources();
        String pkgName = getPackageName();

        return res.getIdentifier(icon, type, pkgName);
    }

    /**
     * Get the visibility constant from a string.
     *
     * @param visibility one of 'public', 'private', 'secret'
     *
     * @return The visibility constant if a match is found, 'private' otherwise
     */
    private int getVisibility (String visibility)
    {
        if (visibility.equals("public")) {
            return Notification.VISIBILITY_PUBLIC;
        } else if (visibility.equals("secret")) {
            return Notification.VISIBILITY_SECRET;
        } else {
            return Notification.VISIBILITY_PRIVATE;
        }
    }
    /**
     * Set notification color if its supported by the SDK.
     *
     * @param notification A Notification.Builder instance
     * @param settings A JSON dict containing the color definition (red: FF0000)
     */
    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    private void setColor(NotificationCompat.Builder notification,
                          JSONObject settings) {

        String hex = settings.optString("color", null);

        if (Build.VERSION.SDK_INT < 21 || hex == null)
            return;

        try {
            int aRGB = Integer.parseInt(hex, 16) + 0xFF000000;
            notification.setColor(aRGB);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Returns the shared notification service manager.
     */
    private NotificationManager getNotificationManager()
    {
        return (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    }
}
