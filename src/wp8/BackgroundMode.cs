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

namespace Cordova.Extension.Commands
{
    /// </summary>
    /// Ermöglicht, dass eine Anwendung im Hintergrund läuft ohne pausiert zu werden
    /// </summary>
    public class BackgroundMode : BaseCommand
    {
        /// </summary>
        /// Flag gibt an, ob die App im Hintergrund wach gehalten werden soll
        /// </summary>
        private static bool IsEnabled = true;

        /// </summary>
        /// Lokalisiert das Smartphone
        /// </summary>
        private static Geolocator Geolocator { get; set; }

        /// </summary>
        /// Registriert die Listener für die (sleep/resume) Events und startet
        /// bzw. stoppt die Geo-Lokalisierung
        /// </summary>
        public BackgroundMode ()
        {
            Activate();
        }

        /// </summary>
        /// @js-interface
        /// Setzt den Flag, dass die App im Hintergrund wach gehalten werden soll
        /// </summary>
        public void enable (string args)
        {
            Enable();
        }

        /// </summary>
        /// @js-interface
        /// Entfernt den Flag, sodass die App im Hintergrund pausiert wird
        /// </summary>
        public void disable (string args)
        {
            Disable();
        }

        /// </summary>
        /// Setzt den Flag, dass die App im Hintergrund wach gehalten werden soll
        /// </summary>
        public static void Enable ()
        {
            IsEnabled = true;
        }

        /// </summary>
        /// Entfernt den Flag, sodass die App im Hintergrund pausiert wird
        /// </summary>
        public static void Disable ()
        {
            IsEnabled = false;

            Deactivate();
        }

        /// </summary>
        /// @js-interface
        /// Registriert die Listener für die (sleep/resume) Events
        /// </summary>
        public void observeLifeCycle (string args)
        {
            // Konstruktor wird aufgerufen, falls Instanz erstellt wurde
        }

        /// </summary>
        /// Startet das Aktualisieren des Standpunktes
        /// </summary>
        public static void Activate ()
        {
            if (Geolocator == null && IsEnabled && IsServiceAvailable())
            {
                Geolocator = new Geolocator();

                Geolocator.DesiredAccuracy   = PositionAccuracy.Default;
                Geolocator.MovementThreshold = 100000;
                Geolocator.PositionChanged  += geolocator_PositionChanged;
            }
        }

        /// </summary>
        /// Beendet das Aktualisieren des Standpunktes
        /// </summary>
        public static void Deactivate ()
        {
            if (Geolocator != null)
            {
                Geolocator.PositionChanged -= geolocator_PositionChanged;
                Geolocator = null;
            }
        }

        private static void geolocator_PositionChanged (Geolocator sender, PositionChangedEventArgs args) {}

        /// </summary>
        /// Gibt an, ob der Lokalisierungsdienst verfügbar ist
        /// </summary>
        private static bool IsServiceAvailable()
        {
            Geolocator geolocator = (Geolocator == null) ? new Geolocator() : Geolocator;

            return !(geolocator.LocationStatus == PositionStatus.Disabled || geolocator.LocationStatus == PositionStatus.NotAvailable);
        }
    }
}
