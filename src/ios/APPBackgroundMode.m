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

#import "APPBackgroundMode.h"

@interface APPBackgroundMode (PrivateMethods)

// Registriert die Listener für die (sleep/resume) Events
- (void) observeLifeCycle:(CDVInvokedUrlCommand *)command;
// Aktiviert den Hintergrundmodus
- (void) enableMode;
// Deaktiviert den Hintergrundmodus
- (void) disableMode;

@end

@implementation APPBackgroundMode

@synthesize locationManager;

/**
 * @js-interface
 *
 * Registriert die Listener für die (sleep/resume) Events.
 */
- (void) observeLifeCycle:(CDVInvokedUrlCommand *)command
{
    // Methode pluginInitialize wird aufgerufen, falls Instanz erstellt wurde
}

/**
 * @js-interface
 *
 * Aktiviert den Hintergrundmodus.
 */
- (void) enable:(CDVInvokedUrlCommand *)command
{
    [self enableMode];
}

/**
 * @js-interface
 *
 * Deaktiviert den Hintergrundmodus.
 */
- (void) disable:(CDVInvokedUrlCommand *)command
{
    [self disableMode];
}

/**
 * Aktiviert den Hintergrundmodus.
 */
- (void) enableMode
{
    _enabled = true;
}

/**
 * Deaktiviert den Hintergrundmodus.
 */
- (void) disableMode
{
    _enabled = false;
}

/**
 * Registriert die Listener für die (sleep/resume) Events und startet bzw. stoppt die Geo-Lokalisierung.
 */
- (void) pluginInitialize
{
    [self enableMode];

    if (&UIApplicationDidEnterBackgroundNotification && &UIApplicationWillEnterForegroundNotification) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(activateMode) name:UIApplicationDidEnterBackgroundNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(deactivateMode) name:UIApplicationWillEnterForegroundNotification object:nil];
    } else {
        [self activateMode];
    }
}

/**
 * Startet das Aktualisieren des Standpunktes.
 */
- (void) activateMode
{
    if (_enabled == false) {
        return;
    };

    if (!locationManager) {
        locationManager = [[CLLocationManager alloc] init];
    };

#ifdef __IPHONE_6_0
    locationManager.activityType = CLActivityTypeFitness;
#endif

    // Empfängt nur Nachrichten, wenn sich die Position um 1km geändert hat
    locationManager.distanceFilter = 1000;
    // Startet das Aktualisieren des Standpunktes
    [locationManager startUpdatingLocation];
}

/**
 * Beendet das Aktualisieren des Standpunktes.
 */
- (void) deactivateMode
{
    if (locationManager) {
        // Beendet das Aktualisieren des Standpunktes
        [locationManager stopUpdatingLocation];
    };
}

@end