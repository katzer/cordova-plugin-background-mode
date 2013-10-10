/**
 *  BackgroundMode.cs
 *  Cordova Background-Mode Plugin
 *
 *  Created by Sebastian Katzer (github.com/katzer) on 08/10/2013.
 *  Copyright 2013 Sebastian Katzer. All rights reserved.
 *  GPL v2 licensed
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
        private static bool isEnabled = true;

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
            isEnabled = true;
        }

        /// </summary>
        /// Entfernt den Flag, sodass die App im Hintergrund pausiert wird
        /// </summary>
        public static void Disable ()
        {
            isEnabled = false;

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
            if (Geolocator == null && isEnabled)
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
    }
}
