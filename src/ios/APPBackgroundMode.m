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
 * @obj-c-interface
 *
 * Deaktiviert den Hintergrundmodus.
 */
- (void) deactivateMode
{
    if (locationManager) {
        [locationManager stopUpdatingLocation];
    };
}

/**
 * Registriert die Listener für die (sleep/resume) Events und startet bzw. stoppt die Geo-Lokalisierung.
 */
- (void) pluginInitialize
{
    if (&UIApplicationDidEnterBackgroundNotification && &UIApplicationWillEnterForegroundNotification) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(activateMode) name:UIApplicationDidEnterBackgroundNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(deactivateMode) name:UIApplicationWillEnterForegroundNotification object:nil];
    } else {
        [self activateMode];
    }
}

@end