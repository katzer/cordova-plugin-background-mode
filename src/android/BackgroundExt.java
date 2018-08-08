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
import android.view.View;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;

import java.lang.ref.WeakReference;
import java.lang.reflect.Method;
import java.util.List;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;



class BackgroundExt {

    // Weak reference to the cordova interface passed by the plugin
    private final WeakReference<CordovaInterface> cordova;

    // Weak reference to the cordova web view passed by the plugin
    private final WeakReference<CordovaWebView> webView;

    /**
     * Initialize the extension to perform non-background related tasks.
     *
     * @param cordova The cordova interface.
     * @param webView The cordova web view.
     */
    private BackgroundExt(CordovaInterface cordova, CordovaWebView webView, JSONArray args) {
        this.cordova = new WeakReference<CordovaInterface>(cordova);
        this.webView = new WeakReference<CordovaWebView>(webView);
    }

    /**
     * Executes the request.
     *
     * @param action  The action to execute.
     * @param cordova The cordova interface.
     * @param webView The cordova web view.
     */
    static void execute(String action, CordovaInterface cordova,
                        CordovaWebView webView, JSONArray args) throws JSONException {

        BackgroundExt ext = new BackgroundExt(cordova, webView, args);

        if (action.equalsIgnoreCase("background")) {
          String pkgName = args.getString(0);
          pkgName = "ru.systtech.mobile";
            ext.moveToBackground(pkgName);
        }
    }

    /**
     * Move app to background.
     */
    private void moveToBackground(String packageName) {

      if (packageName == "") {
        packageName = null;
      }

        Intent intent = new Intent(Intent.ACTION_MAIN);
        intent.addCategory(Intent.CATEGORY_LAUNCHER);

        Activity app = getActivity();
        Intent launchIntent = app.getPackageManager().getLaunchIntentForPackage(packageName);
        launchIntent.addCategory(Intent.CATEGORY_LAUNCHER);

        if (launchIntent != null) {
          app.startActivity(launchIntent);
        }
        else {
          getActivity().startActivity(intent);
        }

    }


    /**
     * The activity referenced by cordova.
     *
     * @return The main activity of the app.
     */
    Activity getActivity() {
        return cordova.get().getActivity();
    }

}
