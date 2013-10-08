/**
 *  APPBackgroundMode.h
 *  Cordova BackgroundMode Plugin
 *
 *  Created by Sebastian Katzer (github.com/katzer) on 08/10/2013.
 *  Copyright 2013 Sebastian Katzer. All rights reserved.
 *  GPL v2 licensed
 */

#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>
#import <CoreLocation/CoreLocation.h>

@interface APPBackgroundMode : CDVPlugin

// Aktiviert den Hintergrundmodus
- (void) activateMode;
// Deaktiviert den Hintergrundmodus
- (void) deactivateMode;

@property (nonatomic, strong) CLLocationManager* locationManager;

@end