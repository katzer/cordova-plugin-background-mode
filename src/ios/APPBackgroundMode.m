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
 * @obj-c-interface
 *
 * Aktiviert den Hintergrundmodus.
 */
- (void) enableMode
{
    _enabled = true;
}

/**
 * @obj-c-interface
 *
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