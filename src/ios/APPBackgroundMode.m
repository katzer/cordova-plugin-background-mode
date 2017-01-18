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

#import "APPMethodMagic.h"
#import "APPBackgroundMode.h"
#import <Cordova/CDVAvailability.h>

@implementation APPBackgroundMode

#pragma mark -
#pragma mark Constants

NSString* const kAPPBackgroundJsNamespace = @"cordova.plugins.backgroundMode";
NSString* const kAPPBackgroundEventActivate = @"activate";
NSString* const kAPPBackgroundEventDeactivate = @"deactivate";
NSString* const kAPPBackgroundEventFailure = @"failure";


#pragma mark -
#pragma mark Life Cycle

/**
 * Called by runtime once the Class has been loaded.
 * Exchange method implementations to hook into their execution.
 */
+ (void) load
{
    [self swizzleWKWebViewEngine];
}

/**
 * Initialize the plugin.
 */
- (void) pluginInitialize
{
    [self.commandDelegate runInBackground:^{
        enabled = NO;
        [self configureAudioPlayer];
        [self configureAudioSession];
        [self observeLifeCycle];
    }];
}

/**
 * Register the listener for pause and resume events.
 */
- (void) observeLifeCycle
{
    NSNotificationCenter* listener = [NSNotificationCenter
                                      defaultCenter];

        [listener addObserver:self
                     selector:@selector(keepAwake)
                         name:UIApplicationDidEnterBackgroundNotification
                       object:nil];

        [listener addObserver:self
                     selector:@selector(stopKeepingAwake)
                         name:UIApplicationWillEnterForegroundNotification
                       object:nil];

        [listener addObserver:self
                     selector:@selector(handleAudioSessionInterruption:)
                         name:AVAudioSessionInterruptionNotification
                       object:nil];
}

#pragma mark -
#pragma mark Interface

/**
 * Enable the mode to stay awake
 * when switching to background for the next time.
 */
- (void) enable:(CDVInvokedUrlCommand*)command
{
    enabled = YES;
    [self execCallback:command];
}

/**
 * Disable the background mode
 * and stop being active in background.
 */
- (void) disable:(CDVInvokedUrlCommand*)command
{
    enabled = NO;
    [self stopKeepingAwake];
    [self execCallback:command];
}

#pragma mark -
#pragma mark Core

/**
 * Keep the app awake.
 */
- (void) keepAwake
{
    if (!enabled)
        return;

    [audioPlayer play];
    [self fireEvent:kAPPBackgroundEventActivate];
}

/**
 * Let the app going to sleep.
 */
- (void) stopKeepingAwake
{
    if (TARGET_IPHONE_SIMULATOR) {
        NSLog(@"BackgroundMode: On simulator apps never pause in background!");
    }

    if (audioPlayer.isPlaying) {
        [self fireEvent:kAPPBackgroundEventDeactivate];
    }

    [audioPlayer pause];
}

/**
 * Configure the audio player.
 */
- (void) configureAudioPlayer
{
    NSString* path = [[NSBundle mainBundle]
                      pathForResource:@"appbeep" ofType:@"wav"];

    NSURL* url = [NSURL fileURLWithPath:path];


    audioPlayer = [[AVAudioPlayer alloc]
                   initWithContentsOfURL:url error:NULL];

    audioPlayer.volume        = 0;
    audioPlayer.numberOfLoops = -1;
};

/**
 * Configure the audio session.
 */
- (void) configureAudioSession
{
    AVAudioSession* session = [AVAudioSession
                               sharedInstance];

    // Don't activate the audio session yet
    [session setActive:NO error:NULL];

    // Play music even in background and dont stop playing music
    // even another app starts playing sound
    [session setCategory:AVAudioSessionCategoryPlayback
             withOptions:AVAudioSessionCategoryOptionMixWithOthers
                   error:NULL];

    // Active the audio session
    [session setActive:YES error:NULL];
};

#pragma mark -
#pragma mark Helper

/**
 * Simply invokes the callback without any parameter.
 */
- (void) execCallback:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult *result = [CDVPluginResult
                               resultWithStatus:CDVCommandStatus_OK];

    [self.commandDelegate sendPluginResult:result
                                callbackId:command.callbackId];
}

/**
 * Restart playing sound when interrupted by phone calls.
 */
- (void) handleAudioSessionInterruption:(NSNotification*)notification
{
    [self fireEvent:kAPPBackgroundEventDeactivate];
    [self keepAwake];
}

/**
 * Method to fire an event with some parameters in the browser.
 */
- (void) fireEvent:(NSString*)event
{
    NSString* active =
    [event isEqualToString:kAPPBackgroundEventActivate] ? @"true" : @"false";

    NSString* flag = [NSString stringWithFormat:@"%@._isActive=%@;",
                      kAPPBackgroundJsNamespace, active];

    NSString* depFn = [NSString stringWithFormat:@"%@.on%@();",
                       kAPPBackgroundJsNamespace, event];

    NSString* fn = [NSString stringWithFormat:@"%@.fireEvent('%@');",
                    kAPPBackgroundJsNamespace, event];

    NSString* js = [NSString stringWithFormat:@"%@%@%@", flag, depFn, fn];

    [self.commandDelegate evalJs:js];
}

#pragma mark -
#pragma mark Swizzling

/**
 * Swizzle some implementations of CDVWKWebViewEngine.
 */
+ (void) swizzleWKWebViewEngine
{
    if (!IsAtLeastiOSVersion(@"8.0"))
        return;

    Class wkWebViewEngineCls = NSClassFromString(@"CDVWKWebViewEngine");
    SEL selector = NSSelectorFromString(@"createConfigurationFromSettings:");

    if (!wkWebViewEngineCls)
        return;

    SwizzleSelectorWithBlock_Begin(wkWebViewEngineCls, selector)
    ^(CDVPlugin *self, NSDictionary *settings) {
        id obj = ((id (*)(id, SEL, NSDictionary*))_imp)(self, _cmd, settings);

        SEL sel = NSSelectorFromString(@"_setAlwaysRunsAtForegroundPriority:");
        ((void (*)(id, SEL, BOOL))[obj methodForSelector:sel])(obj, sel, YES);

        return obj;
    }
    SwizzleSelectorWithBlock_End;
}

@end
