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

@implementation APPBackgroundMode

#pragma mark -
#pragma mark Initialization methods

/**
 * Initialize the plugin.
 */
- (void) pluginInitialize
{
    [self enable:NULL];
    [self configureAudioPlayer];
    [self configureAudioSession];
}

/**
 * Register the listener for pause and resume events.
 */
- (void) observeLifeCycle:(CDVInvokedUrlCommand *)command
{
    NSNotificationCenter* listener = [NSNotificationCenter defaultCenter];

    if (&UIApplicationDidEnterBackgroundNotification && &UIApplicationWillEnterForegroundNotification) {

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

    } else {
        [self keepAwake];
    }
}

#pragma mark -
#pragma mark Interface methods

/**
 * Enable the mode to stay awake
 * when switching to background for the next time.
 */
- (void) enable:(CDVInvokedUrlCommand *)command
{
    enabled = YES;
}

/**
 * Disable the background mode
 * and stop being active in background.
 */
- (void) disable:(CDVInvokedUrlCommand *)command
{
    enabled = NO;

    [self stopKeepingAwake];
}

#pragma mark -
#pragma mark Core methods

/**
 * Keep the app awake.
 */
- (void) keepAwake {
    if (enabled) {
        [audioPlayer play];
    }
}

/**
 * Let the app going to sleep.
 */
- (void) stopKeepingAwake {
    [audioPlayer pause];
}

/**
 * Configure the audio player.
 */
- (void) configureAudioPlayer {
    NSString* path = [[NSBundle mainBundle] pathForResource:@"silent"
                                                     ofType:@"wav"];

    NSURL* url = [NSURL fileURLWithPath:path];


    audioPlayer = [[AVAudioPlayer alloc] initWithContentsOfURL:url
                                                         error:NULL];

    // Silent
    audioPlayer.volume = 0;
    // Infinite
    audioPlayer.numberOfLoops = -1;
};

/**
 * Configure the audio session.
 */
- (void) configureAudioSession {
    AVAudioSession* session = [AVAudioSession
                               sharedInstance];

    // Play music even in background and dont stop playing music
    // even another app starts playing sound
    [session setCategory:AVAudioSessionCategoryPlayback
             withOptions:AVAudioSessionCategoryOptionMixWithOthers
                   error:NULL];

    [session setActive:YES error:NULL];
};

/**
 * Handle audio session interruption.
 */
- (void) handleAudioSessionInterruption:(NSNotification*)notification {
    NSNumber* receivedType = [notification.userInfo
                              valueForKey:AVAudioSessionInterruptionTypeKey];

    NSNumber* expectedType = [NSNumber numberWithInt:AVAudioSessionInterruptionTypeEnded];

    if ([receivedType isEqualToNumber:expectedType]) {
        [self configureAudioSession];
        [self keepAwake];
    }
}

@end
