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

using WPCordovaClassLib.Cordova.Commands;
using Windows.Devices.Geolocation;
using Microsoft.Phone.Shell;

namespace Cordova.Extension.Commands
{
    /// </summary>
    /// Ermöglicht, dass eine Anwendung im Hintergrund läuft ohne pausiert zu werden
    /// </summary>
    public class BackgroundMode : BaseCommand
    {
        /// </summary>
        /// Flag indicates if the plugin is enabled or disabled
        /// </summary>
        private bool IsDisabled = true;

        /// </summary>
        /// Geolocator to monitor location changes
        /// </summary>
        private static Geolocator Geolocator { get; set; }

        /// </pragma mark>
        /// Interface methods
        /// </pragma mark>

        /// </summary>
        /// Enable the mode to stay awake when switching
        /// to background for the next time.
        /// </summary>
        public void enable (string args)
        {
            IsDisabled = false;
        }

        /// </summary>
        /// Disable the background mode and stop
        /// being active in background.
        /// </summary>
        public void disable (string args)
        {
            IsDisabled = true;

            Deactivate();
        }

        /// </pragma mark>
        /// Core methods
        /// </pragma mark>

        /// </summary>
        /// Keep the app awake by tracking
        /// for position changes.
        /// </summary>
        public void Activate ()
        {
            if (IsDisabled || Geolocator != null)
                return;

            if (!IsServiceAvailable())
                return;

            Geolocator = new Geolocator();

            Geolocator.DesiredAccuracy   = PositionAccuracy.Default;
            Geolocator.MovementThreshold = 100000;
            Geolocator.PositionChanged  += geolocator_PositionChanged;
        }

        /// </summary>
        /// Let the app going to sleep.
        /// </summary>
        public void Deactivate ()
        {
            if (Geolocator == null)
                return;

            Geolocator.PositionChanged -= geolocator_PositionChanged;
            Geolocator = null;
        }

        /// </pragma mark>
        /// Helper methods
        /// </pragma mark>

        /// </summary>
        /// Determine if location service is available and enabled.
        /// </summary>
        private bool IsServiceAvailable()
        {
            Geolocator geolocator = (Geolocator == null) ? new Geolocator() : Geolocator;

            PositionStatus status = geolocator.LocationStatus;

            if (status == PositionStatus.Disabled)
                return false;

            if (status == PositionStatus.NotAvailable)
                return false;

            return true;
        }

        /// </pragma mark>
        /// Delegate methods
        /// </pragma mark>

        private void geolocator_PositionChanged(Geolocator sender, PositionChangedEventArgs args) {
            // Nothing to do here
        }

        /// <summary>
        /// Occurs when the application is being deactivated.
        /// </summary>
        public override void OnPause(object sender, DeactivatedEventArgs e)
        {
            Activate();
        }

        /// <summary>
        /// Occurs when the application is being made active after previously being put
        /// into a dormant state or tombstoned.
        /// </summary>
        public override void OnResume(object sender, ActivatedEventArgs e)
        {
            Deactivate();
        }
    }
}
