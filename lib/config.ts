/**
 * SAFE MODE: Vereinfachter Scanner für Entwicklung/Debugging
 * 
 * Wenn SAFE_MODE = true:
 * - Crawler verwendet keinen Playwright, nur schnelle Dummy-Daten
 * - Checks geben statische Beispiel-Issues zurück
 * - Scans sind in wenigen Sekunden fertig
 * 
 * Setze SAFE_MODE = false für vollständige Analyse mit Playwright
 */
export const SAFE_MODE = false

/**
 * Whitelist für Domains, die immer einen Score von 100 erhalten
 * 
 * Hinweis: Bestimmte eigene Domains erhalten aus Präsentationsgründen immer Score 100.
 * Die Domains sollten hier ohne Protokoll (http:// oder https://) und ohne Pfad eingetragen werden.
 * 
 * Beispiele:
 * - "sitesweep.de" (matcht auch www.sitesweep.de)
 * - "www.sitesweep.de" (nur exakte Subdomain)
 * 
 * Die Score-Überschreibung findet in buildReport() statt, nach der normalen Score-Berechnung.
 * Issues werden trotzdem normal erzeugt, nur der Score wird auf 100 gesetzt.
 */
export const SCANNER_ALWAYS_MAX_SCORE_DOMAINS: string[] = [
  'example.com',     // TODO: Hier eigene Domain eintragen, z.B. 'sitesweep.de'
  'www.example.com', // TODO: Hier eigene Domain mit www eintragen, z.B. 'www.sitesweep.de'
]

