/**
 * System Prompts für Cursor AI
 * 
 * Diese Prompts werden verwendet, um Cursor AI zu instruieren,
 * wie Client-Websites basierend auf Master Templates und
 * geernteten Daten gebaut werden sollen.
 */

export interface SystemPrompt {
  id: string
  title: string
  description: string
  promptText: string
}

export const systemPrompts: SystemPrompt[] = [
  {
    id: 'craft-relaunch',
    title: 'Handwerker / Craft Relaunch',
    description: 'Für Maler, Dachdecker, SHK-Betriebe. Nutzt das Template_Craft.tsx für eine robuste, vertrauenswürdige Präsenz.',
    promptText: `Ich möchte die bestehende Website eines Handwerkskunden neu designen.

⚠️ WICHTIG - STRIKTE REGEL:
- Verwende NUR die Texte aus den vorhandenen Dateien (startseite.md, kontakt.txt)
- Erfinde KEINE neuen Inhalte, Headlines oder Texte
- Füge KEINE zusätzlichen Leistungen oder Features hinzu
- Verwende NUR die vorhandenen Bilder (keine neuen URLs, keine Platzhalter)
- Wenn etwas fehlt → Lass es weg, erfinde es NICHT

INPUT:
1. Design-Basis: Die Komponente \`Template_Craft.tsx\` (aus meiner Library).
2. Inhalt: Die Textdatei \`startseite.md\` (aus dem Harvester-ZIP).
3. Bilder: Die Bilder im Ordner \`/images\` (aus dem Harvester-ZIP).
4. Kontaktdaten: Die Datei \`kontakt_info.txt\` (aus dem Harvester-ZIP).

AUFGABE:
Erstelle die Datei \`/app/page.tsx\`.
- Importiere \`Template_Craft\` und übergebe die Props.
- Mappe die EXISTIERENDEN Inhalte aus der Markdown-Datei 1:1 auf die Komponente.
- Nutze NUR die lokal vorhandenen Bilder aus \`/images\`.
- Verwende die exakten Texte - keine Umformulierungen, keine "Verbesserungen".
- Übernimm Telefonnummer, E-Mail und Adresse genau aus \`kontakt_info.txt\`.

CONTENT-MAPPING (1:1):
- Hero-Headline → Übernimm die erste H1 aus startseite.md (exakt)
- Leistungen → Übernimm die Liste aus dem Abschnitt "Leistungen" (exakt, keine Erfindungen)
- Über-uns-Text → Übernimm den "Über uns" Abschnitt (falls vorhanden)
- Kontakt → Übernimm Telefon/E-Mail/Adresse aus kontakt_info.txt

TECHNISCHE OPTIMIERUNG (Dein Fokus):
- Saubere TypeScript-Typen
- Next.js 14 App Router Best Practices
- Responsive Design (Mobile First)
- SEO: Meta-Tags aus den vorhandenen Texten generieren
- Performance: Bilder optimieren (next/image)
- Accessibility: Semantisches HTML, ARIA-Labels

DO NOT:
❌ Neue Texte erfinden
❌ Leistungen hinzufügen, die nicht im Harvester-Text stehen
❌ Headlines "verbessern" oder umschreiben
❌ Platzhalter-Bilder einfügen (Unsplash, Lorem Picsum, etc.)
❌ Fake-Testimonials oder Bewertungen hinzufügen`
  },
  {
    id: 'trust-relaunch',
    title: 'Kanzlei & Praxis / Trust Relaunch',
    description: 'Für Anwälte, Ärzte, Steuerberater. Nutzt das Template_Trust.tsx für eine seriöse, vertrauenswürdige Darstellung.',
    promptText: `Ich möchte die bestehende Website einer Kanzlei/Praxis neu designen.

⚠️ WICHTIG - STRIKTE REGEL:
- Verwende NUR die Texte aus den vorhandenen Dateien (startseite.md, kontakt_info.txt)
- Erfinde KEINE neuen Leistungen, Rechtsgebiete oder Behandlungsmethoden
- Füge KEINE Team-Mitglieder hinzu, die nicht im Harvester-Text stehen
- Verwende NUR die vorhandenen Bilder (keine Stock-Fotos einfügen)
- Keine erfundenen Öffnungszeiten, Notfall-Nummern oder Preise
- Wenn etwas fehlt → Lass es weg, erfinde es NICHT

INPUT:
1. Design-Basis: Die Komponente \`Template_Trust.tsx\`.
2. Inhalt: Die Textdatei \`startseite.md\` (aus dem Harvester-ZIP).
3. Kontaktdaten: Die Datei \`kontakt_info.txt\` (aus dem Harvester-ZIP).
4. Bilder: NUR die Bilder aus \`/images/\` (falls vorhanden).

AUFGABE:
Erstelle die \`/app/page.tsx\`.
- Importiere \`Template_Trust\` und übergebe die Props.
- Mappe die EXISTIERENDEN Inhalte 1:1 auf die Komponente.
- Übernimm alle Texte wörtlich - keine Umformulierungen.
- Verwende NUR vorhandene Bilder aus \`/images/\`.
- Telefonnummer und E-Mail aus \`kontakt_info.txt\` übernehmen (exakt).

CONTENT-MAPPING (1:1):
- Hero-Headline → Übernimm die erste H1 aus startseite.md (exakt)
- Leistungen/Rechtsgebiete → Übernimm die Liste aus dem "Leistungen"-Abschnitt (falls vorhanden, sonst weglassen)
- Team → Übernimm Namen/Qualifikationen aus dem "Team"-Abschnitt (falls vorhanden, sonst weglassen)
- Über uns → Übernimm den vorhandenen Text (exakt, keine Ergänzungen)
- Kontakt → Telefon/E-Mail/Adresse aus kontakt_info.txt (exakt)

TECHNISCHE OPTIMIERUNG (Dein Fokus):
- Saubere TypeScript-Typen
- Next.js 14 App Router
- Responsive Design
- SEO: Meta-Tags aus den vorhandenen Texten
- Accessibility: Semantisches HTML
- Links: tel: und mailto: richtig verlinken

DO NOT:
❌ Neue Leistungen oder Rechtsgebiete erfinden
❌ Team-Mitglieder hinzufügen, die nicht im Harvester stehen
❌ Öffnungszeiten erfinden (nur wenn explizit im Text)
❌ Fake-Bewertungen oder Testimonials
❌ Platzhalter-Bilder einfügen
❌ Texte "verbessern" oder umschreiben`
  },
  {
    id: 'modern-relaunch',
    title: 'Modern / Agentur Relaunch',
    description: 'Für Coaches, Agenturen, Startups. Nutzt das Template_Modern.tsx für einen frischen, dynamischen Auftritt.',
    promptText: `Ich möchte die bestehende Website eines Coaches/einer Agentur neu designen.

⚠️ WICHTIG - STRIKTE REGEL:
- Verwende NUR die Texte aus den vorhandenen Dateien (startseite.md)
- Erfinde KEINE neue Value Proposition oder Features
- Füge KEINE Testimonials, Bewertungen oder Kundenzahlen hinzu, die nicht im Text stehen
- Verwende NUR die vorhandenen Bilder und Logos (keine neuen einfügen)
- Keine erfundenen Preise, Angebote oder "Limited Offers"
- Wenn etwas fehlt → Lass es weg, erfinde es NICHT

INPUT:
1. Design-Basis: \`Template_Modern.tsx\`.
2. Inhalt: Die Textdatei \`startseite.md\` (aus dem Harvester-ZIP).
3. Kontaktdaten: Die Datei \`kontakt_info.txt\` (aus dem Harvester-ZIP).
4. Bilder: NUR die Bilder aus \`/images/\` und Logo aus \`/public/\` (falls vorhanden).

AUFGABE:
Erstelle die \`/app/page.tsx\`.
- Importiere \`Template_Modern\` und übergebe die Props.
- Mappe die EXISTIERENDEN Inhalte 1:1 auf die Komponente.
- Übernimm alle Texte wörtlich - keine Umformulierungen.
- Verwende NUR vorhandene Bilder aus \`/images/\`.
- UVP/Headline → Übernimm die erste H1 aus startseite.md (exakt).

CONTENT-MAPPING (1:1):
- Hero-Headline → Die vorhandene H1 aus startseite.md (exakt, nicht umschreiben)
- Features/Leistungen → Übernimm die Liste aus dem Text (falls vorhanden)
- Über uns → Übernimm den vorhandenen Text (exakt)
- Social Proof → NUR wenn explizit im Harvester-Text (keine Erfindungen)
- CTA-Button-Text → Übernimm den vorhandenen Text (z.B. "Kontakt aufnehmen")
- Kontakt → Telefon/E-Mail aus kontakt_info.txt

TECHNISCHE OPTIMIERUNG (Dein Fokus):
- Saubere TypeScript-Typen
- Next.js 14 App Router
- Responsive Design (Mobile First)
- Icons: Wähle passende Icons aus 'lucide-react' für die vorhandenen Features
- Animationen: Subtile Hover-Effekte, Scroll-Reveal (framer-motion)
- SEO: Meta-Tags aus den vorhandenen Texten
- Performance: next/image für Optimierung

DESIGN-STIL:
- Viel Weißraum (Clean Look)
- Moderne, klare Typografie
- Subtile Animationen (nicht übertrieben)
- Responsive (Mobile First)

DO NOT:
❌ Neue Features oder Value Propositions erfinden
❌ Testimonials hinzufügen, die nicht im Harvester stehen
❌ Fake-Kundenzahlen oder Statistiken
❌ "Limited Offer" oder Urgency-Elemente erfinden
❌ Preise hinzufügen, die nicht im Text stehen
❌ Headlines "optimieren" oder umschreiben
❌ Platzhalter-Bilder einfügen`
  }
]

