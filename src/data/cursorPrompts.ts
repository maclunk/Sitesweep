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
    promptText: `Ich möchte eine neue Seite für einen Handwerkskunden bauen.

INPUT:
1. Design-Basis: Die Komponente \`Template_Craft.tsx\` (aus meiner Library).
2. Inhalt: Die Textdatei \`startseite.md\` (aus dem Harvester-ZIP).
3. Bilder: Die Bilder im Ordner \`/images\` (aus dem Harvester-ZIP).

AUFGABE:
Erstelle die Datei \`/app/page.tsx\`.
- Importiere \`Template_Craft\`.
- Mappe die Inhalte aus der Markdown-Datei intelligent auf die Props der Komponente (heroHeadline, services, contact).
- Nutze die lokal vorhandenen Bilder. Falls Bilder fehlen, nutze Unsplash-Platzhalter (Thema: Construction, Tools, Handwerk).
- Die Seite muss fix und fertig kompilieren.
- Achte auf korrekte TypeScript-Typen.
- Verwende Next.js 14 App Router Konventionen.

DESIGN-VORGABEN:
- Farben: Kräftige, handwerkliche Farben (Blau, Orange, Grau)
- Schrift: Sans-serif, gut lesbar
- Bilder: Hochwertig, professionell (keine Stock-Foto-Klischees)
- Call-to-Actions: Prominent, klar formuliert

CONTENT-STRUKTUR:
- Hero mit starker Headline (Problem → Lösung)
- Leistungen (3-6 Kacheln mit Icons)
- Über uns (Meisterbetrieb, Erfahrung, Team)
- Prozess (Wie wir arbeiten, 3-5 Schritte)
- Kontakt (Telefon, E-Mail, Adresse, Google Maps)

TECHNISCHE ANFORDERUNGEN:
- Responsive Design (Mobile First)
- SEO-optimiert (Meta-Tags, strukturierte Daten)
- Performance (optimierte Bilder, Lazy Loading)
- Accessibility (ARIA-Labels, Kontraste)`
  },
  {
    id: 'trust-relaunch',
    title: 'Kanzlei & Praxis / Trust Relaunch',
    description: 'Für Anwälte, Ärzte, Steuerberater. Nutzt das Template_Trust.tsx für eine seriöse, vertrauenswürdige Darstellung.',
    promptText: `Ich baue eine Website für einen vertrauenswürdigen Dienstleister (Arzt/Anwalt/Steuerberater).

INPUT:
1. Design-Basis: Die Komponente \`Template_Trust.tsx\`.
2. Inhalt: Die Textdatei \`startseite.md\` + \`kontakt.txt\`.
3. Team-Fotos (falls vorhanden): \`/images/team/\`.

AUFGABE:
Erstelle die \`/app/page.tsx\`.
- Nutze eine seriöse, professionelle Tonalität.
- Fülle die 'Services'-Sektion mit den extrahierten Leistungen aus dem Text (z.B. Rechtsgebiete, Behandlungsmethoden).
- Achte darauf, dass Telefonnummer und E-Mail im Header korrekt verlinkt sind (tel:, mailto:).
- Farbgebung: Dunkelblau / Schiefergrau (passend zum Template).
- Verwende hochwertige, authentische Bilder (keine übertriebenen Stock-Fotos).

DESIGN-VORGABEN:
- Farben: Vertrauensbildend (Dunkelblau, Grau, Weiß)
- Typografie: Seriös, gut lesbar (z.B. Inter, Open Sans)
- Layout: Klar strukturiert, viel Weißraum
- Bilder: Professionell, authentisch (echte Team-Fotos bevorzugt)

CONTENT-STRUKTUR:
- Hero mit vertrauensbildender Headline (Kompetenz + Empathie)
- Leistungen / Fachgebiete (detailliert beschrieben)
- Team-Vorstellung (mit Fotos, Qualifikationen)
- Philosophie / Werte (Warum uns wählen?)
- Kontakt & Terminbuchung (niederschwellig, einladend)

BESONDERHEITEN FÜR MEDIZINISCHE PRAXEN:
- Öffnungszeiten prominent
- Notfall-Kontakt hervorheben
- Barrierefreiheit erwähnen (falls zutreffend)
- Online-Terminbuchung integrieren (falls gewünscht)

BESONDERHEITEN FÜR KANZLEIEN:
- Rechtsgebiete klar gliedern
- Erstberatung / Kostenvoranschlag erwähnen
- Diskretion / Schweigepflicht betonen
- Erfolge / Spezialisierungen hervorheben

TECHNISCHE ANFORDERUNGEN:
- DSGVO-konform (Privacy Policy, Cookie Banner)
- SSL/HTTPS (für sensible Daten)
- Kontaktformular mit Spam-Schutz
- Mobile-optimiert (viele Patienten/Mandanten suchen mobil)`
  },
  {
    id: 'modern-relaunch',
    title: 'Modern / Agentur Relaunch',
    description: 'Für Coaches, Agenturen, Startups. Nutzt das Template_Modern.tsx für einen frischen, dynamischen Auftritt.',
    promptText: `Erstelle eine Landingpage im modernen SaaS-Stil.

INPUT:
1. Design-Basis: \`Template_Modern.tsx\`.
2. Inhalt: \`startseite.md\`.
3. Brand Assets: \`/public/logo.svg\`, \`/public/brand-colors.json\` (falls vorhanden).

AUFGABE:
- Extrahiere die "Unique Value Proposition" (UVP) aus dem Text für die Hero-Headline.
- Nutze 'lucide-react' Icons für die Feature-Liste (wähle passende Icons intelligent aus).
- Das Design soll viel Weißraum haben (Clean Look).
- Animationen: Subtile Hover-Effekte, Scroll-Animationen (framer-motion).
- Call-to-Actions: Prominent, conversion-optimiert.

DESIGN-VORGABEN:
- Farben: Modern, lebendig (z.B. Gradient-Akzente)
- Typografie: Klar, modern (z.B. Inter, Poppins)
- Layout: Asymmetrisch, dynamisch, viel Whitespace
- Bilder: Illustrationen oder hochwertige Fotos
- Interaktivität: Hover-Effekte, Micro-Interactions

CONTENT-STRUKTUR:
- Hero mit starker UVP (Wert in 1 Satz)
- Problem-Awareness (Warum braucht der Kunde das?)
- Lösung / Features (3-6 Hauptfeatures mit Icons)
- Social Proof (Testimonials, Logos, Zahlen)
- Pricing (falls zutreffend, klar und transparent)
- Call-to-Action (mehrfach, prominent)

MODERNE FEATURES:
- Dark Mode Support (falls gewünscht)
- Scroll-Animationen (Elemente faden beim Scrollen ein)
- Gradient-Buttons (moderne Farbverläufe)
- Glasmorphism-Effekte (subtil, nicht übertrieben)
- Interactive Cards (Hover-Effekte, 3D-Transforms)

CONVERSION-OPTIMIERUNG:
- Above-the-Fold: Klare Value Proposition + CTA
- Social Proof früh einbinden (Logo-Bar, Testimonial)
- Reibungslose User Journey (logischer Aufbau)
- Urgency schaffen (Limited Offer, nur noch X Plätze)
- Trust-Elemente (Sicherheit, Geld-zurück-Garantie)

TECHNISCHE ANFORDERUNGEN:
- Performance: Lighthouse Score > 90
- SEO: Meta-Tags, Open Graph, Schema.org
- Analytics: Google Analytics / Plausible eingebunden
- Tracking: Conversion-Events für wichtige Aktionen
- A/B-Testing ready (falls gewünscht)

TONE OF VOICE:
- Dynamisch, inspirierend
- Du-Ansprache (persönlich, direkt)
- Emotionen wecken (nicht nur Features listen)
- Storytelling nutzen (Problem → Lösung → Transformation)`
  }
]

