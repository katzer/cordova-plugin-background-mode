/**
 *  APPBackgroundMode.m
 *  Cordova BackgroundMode Plugin
 *
 *  Created by Sebastian Katzer (github.com/katzer) on 08/10/2013.
 *  Copyright 2013 Sebastian Katzer. All rights reserved.
 *  GPL v2 licensed
 */

#import "APPBackgroundMode.h"

@interface APPBackgroundMode (PrivateMethods)

// Registriert die Listener für die (sleep/resume) Events
- (void) observeLifeCycle:(CDVInvokedUrlCommand *)command;
// Aktiviert den Hintergrundmodus
- (void) activateMode;
// Deaktiviert den Hintergrundmodus
- (void) deactivateMode;

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
- (void) activate:(CDVInvokedUrlCommand *)command
{
    [self activateMode];
}

/**
 * @js-interface
 *
 * Deaktiviert den Hintergrundmodus.
 */
- (void) deactivate:(CDVInvokedUrlCommand *)command
{
    [self deactivateMode];
}

/**
 * @obj-c-interface
 *
 * Aktiviert den Hintergrundmodus.
 */
- (void) activateMode
{
    _activated = true;
}

/**
 * @obj-c-interface
 *
 * Deaktiviert den Hintergrundmodus.
 */
- (void) deactivateMode
{
    _activated = false;
}

/**
 * Registriert die Listener für die (sleep/resume) Events und startet bzw. stoppt die Geo-Lokalisierung.
 */
- (void) pluginInitialize
{
    [self activateMode];

    if (&UIApplicationDidEnterBackgroundNotification && &UIApplicationWillEnterForegroundNotification) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(startUpdatingLocation) name:UIApplicationDidEnterBackgroundNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(stopUpdatingLocation) name:UIApplicationWillEnterForegroundNotification object:nil];
    } else {
        [self startUpdatingLocation];
    }
}

/**
 * Startet das Aktualisieren des Standpunktes.
 */
- (void) startUpdatingLocation
{
    if (_activated == false) {
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
- (void) stopUpdatingLocation
{
    if (locationManager) {
        // Beendet das Aktualisieren des Standpunktes
        [locationManager stopUpdatingLocation];
    };
}

@end