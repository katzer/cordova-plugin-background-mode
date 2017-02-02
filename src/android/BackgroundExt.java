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
    private BackgroundExt(CordovaInterface cordova, CordovaWebView webView) {
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
                        CordovaWebView webView) {

        BackgroundExt ext = new BackgroundExt(cordova, webView);

        if (action.equalsIgnoreCase("optimizations")) {
            ext.disableWebViewOptimizations();
        }

        if (action.equalsIgnoreCase("background")) {
            ext.moveToBackground();
        }

        if (action.equalsIgnoreCase("foreground")) {
            ext.moveToForeground();
        }

        if (action.equalsIgnoreCase("tasklist")) {
            ext.excludeFromTaskList();
        }
    }

    /**
     * Move app to background.
     */
    private void moveToBackground() {
        Intent intent = new Intent(Intent.ACTION_MAIN);

        intent.addCategory(Intent.CATEGORY_HOME);
        getActivity().startActivity(intent);
    }

    /**
     * Move app to foreground.
     */
    private void moveToForeground() {
        Activity    app = getActivity();
        String pkgName  = app.getPackageName();

        Intent intent = app
                .getPackageManager()
                .getLaunchIntentForPackage(pkgName);

        intent.addFlags(  Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
                        | Intent.FLAG_ACTIVITY_SINGLE_TOP);

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
                    getActivity().runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            View view = webView.get().getEngine().getView();

                            try {
                                Class<?> xWalkCls = Class.forName(
                                        "org.crosswalk.engine.XWalkCordovaView");

                                Method onShowMethod =
                                        xWalkCls.getMethod("onShow");

                                onShowMethod.invoke(view);
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
        ActivityManager am = (ActivityManager) getActivity()
                .getSystemService(Context.ACTIVITY_SERVICE);

        if (am == null || Build.VERSION.SDK_INT < 21)
            return;

        List<AppTask> tasks = am.getAppTasks();

        if (tasks == null || tasks.isEmpty())
            return;

        tasks.get(0).setExcludeFromRecents(true);
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