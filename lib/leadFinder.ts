/**
 * Lead-Finder-Kernlogik für die Next.js-App
 * 
 * Diese Datei ist komplett eigenständig und enthält die vollständige
 * Implementierung für die Lead-Suche. Sie wird von der Next.js-App direkt verwendet.
 */

/**
 * Repräsentiert einen Business-Lead mit allen verfügbaren Informationen
 */
export type BusinessLead = {
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  category?: string;
  source?: string;      // z. B. Domain des Verzeichnisses
  sourceUrl?: string;   // konkrete URL, auf der der Eintrag gefunden wurde
  createdAt: string;    // ISO-String
};

/**
 * Suchparameter für die Lead-Generierung
 */
export type LeadSearchParams = {
  category: string; // Branche, z. B. "Zahnarzt"
  city: string;     // Stadt, z. B. "Köln"
  limit?: number;   // maximale Anzahl Ergebnisse
};

/**
 * Interface für Datenquellen (LeadSources)
 * 
 * Jede Datenquelle (z. B. Google Places API, Branchenverzeichnis, etc.)
 * implementiert dieses Interface, um Leads zu liefern.
 */
type LeadSource = {
  /**
   * Name der Datenquelle (z. B. "google-places", "gelbe-seiten", etc.)
   */
  name: string;

  /**
   * Holt Leads basierend auf den Suchparametern
   * 
   * @param params - Suchparameter (Branche, Stadt, Limit)
   * @returns Promise mit Array von BusinessLeads
   */
  fetchLeads(params: LeadSearchParams): Promise<BusinessLead[]>;
};

/**
 * Einfache Beispiel-Quelle für Leads (Mock-Daten)
 * 
 * WICHTIG: Diese Datei enthält aktuell nur Mock-Daten für Entwicklung.
 * 
 * Später können hier echte Datenquellen implementiert werden, z. B.:
 * - Google Places API
 * - Branchenverzeichnisse (Gelbe Seiten, Das Örtliche, etc.)
 * - Lokale Business-Portale
 * 
 * Bei der Implementierung echter Quellen ist zu beachten:
 * - Terms of Service der jeweiligen Anbieter
 * - robots.txt respektieren
 * - Rate Limiting einhalten
 * - Datenschutzbestimmungen beachten
 */
const exampleSource: LeadSource = {
  name: 'example',

  async fetchLeads(params: LeadSearchParams): Promise<BusinessLead[]> {
    // Simuliere eine kleine Verzögerung (wie bei echten API-Aufrufen)
    await new Promise(resolve => setTimeout(resolve, 500));

    const now = new Date().toISOString();
    const limit = params.limit ?? 50;

    // Generiere Beispiel-Leads basierend auf den Suchparametern
    const leads: BusinessLead[] = [];
    const names = [
      'Praxis Dr. Schmidt',
      'Praxis Dr. Müller',
      'Praxis Dr. Weber',
      'Praxis Dr. Fischer',
      'Praxis Dr. Wagner',
      'Praxis Dr. Becker',
      'Praxis Dr. Schulz',
      'Praxis Dr. Hoffmann',
      'Praxis Dr. Klein',
      'Praxis Dr. Wolf',
      'Praxis Dr. Zimmermann',
      'Praxis Dr. Braun',
      'Praxis Dr. Neumann',
      'Praxis Dr. Schwarz',
      'Praxis Dr. Lange',
    ];

    const streets = [
      'Hauptstraße',
      'Bahnhofstraße',
      'Kirchplatz',
      'Marktplatz',
      'Schulstraße',
      'Parkstraße',
      'Ringstraße',
      'Dorfstraße',
    ];

    // Generiere Leads
    for (let i = 0; i < Math.min(limit, names.length); i++) {
      const streetNumber = Math.floor(Math.random() * 100) + 1;
      const phoneArea = Math.floor(Math.random() * 900) + 100;
      const phoneNumber = Math.floor(Math.random() * 9000000) + 1000000;
      const nameSlug = names[i].toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');

      leads.push({
        name: names[i],
        website: `https://www.${nameSlug}.de`,
        email: `info@${nameSlug}.de`,
        phone: `0${phoneArea} ${phoneNumber}`,
        address: `${streets[i % streets.length]} ${streetNumber}`,
        city: params.city,
        category: params.category,
        source: 'example',
        sourceUrl: `https://verzeichnis.example/${params.category.toLowerCase()}/${params.city.toLowerCase()}/${i + 1}`,
        createdAt: now,
      });
    }

    return leads;
  },
};

/**
 * Führt eine Lead-Suche durch
 * 
 * Diese Funktion aggregiert Leads aus verschiedenen Datenquellen,
 * entfernt Duplikate und gibt ein Array von BusinessLeads zurück.
 * 
 * @param params - Suchparameter (Branche, Stadt, Limit)
 * @returns Promise mit Array von BusinessLeads
 */
export async function runLeadSearch(params: LeadSearchParams): Promise<BusinessLead[]> {
  // LeadSources laden
  // Fürs MVP: nur exampleSource
  // Später können hier weitere Quellen hinzugefügt werden
  const sources: LeadSource[] = [
    exampleSource,
    // Hier können später weitere Quellen hinzugefügt werden:
    // googlePlacesSource,
    // gelbeSeitenSource,
    // etc.
  ];

  // Leads von allen Quellen sammeln
  const allLeads: BusinessLead[] = [];

  for (const source of sources) {
    try {
      const leads = await source.fetchLeads(params);
      allLeads.push(...leads);
    } catch (err) {
      // Bei Fehler: Logging, aber weiter mit anderen Quellen
      console.error(`Lead-Quelle "${source.name}" hat einen Fehler erzeugt:`, err);
      // Für MVP: Fehler loggen, aber nicht den gesamten Prozess abbrechen
    }
  }

  // Duplikate anhand name+website entfernen
  const deduped: BusinessLead[] = [];
  const seen = new Set<string>();

  for (const lead of allLeads) {
    const key = `${(lead.name || '').toLowerCase().trim()}|${(lead.website || '').toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(lead);
    }
  }

  // Limit global berücksichtigen
  const limit = params.limit ?? 50;
  return deduped.slice(0, limit);
}
