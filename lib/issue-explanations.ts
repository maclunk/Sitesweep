/**
 * Issue Explanation Map - Business-oriented explanations for Handwerker/KMU
 * 
 * Maps technical issue IDs to business-friendly explanations that explain:
 * - What it means for visitors
 * - What it likely costs in lost leads
 * - Why it matters now
 * - How hard it is to fix
 */

export interface IssueExplanation {
  titleBusiness: string
  explanationBusiness: string
  impactLabel: string
  fixEffort: 'easy' | 'medium' | 'hard'
}

export const issueExplanationMap: Record<string, IssueExplanation> = {
  // Technical Issues
  '404-pages': {
    titleBusiness: 'Fehlende Seiten verärgern Besucher',
    explanationBusiness:
      'Besucher klicken auf Links und landen auf Seiten, die nicht existieren. Erfahrungsgemäß springen viele Nutzer dann ab, bevor sie anfragen. Das kostet potenzielle Aufträge – besonders wenn es auf wichtigen Seiten wie Kontakt oder Leistungen passiert.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'technical-404-pages': {
    titleBusiness: 'Fehlende Seiten verärgern Besucher',
    explanationBusiness:
      'Besucher klicken auf Links und landen auf Seiten, die nicht existieren. Erfahrungsgemäß springen viele Nutzer dann ab, bevor sie anfragen. Das kostet potenzielle Aufträge – besonders wenn es auf wichtigen Seiten wie Kontakt oder Leistungen passiert.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'technical-broken-links': {
    titleBusiness: 'Defekte Links auf Ihrer Website',
    explanationBusiness:
      'Links auf Ihrer Website führen ins Leere. Besucher die darauf klicken, verlieren das Vertrauen und gehen oft zur Konkurrenz. Studien zeigen: Jeder defekte Link kostet potenzielle Kunden.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'no-ssl': {
    titleBusiness: 'Website wird als "Nicht sicher" angezeigt',
    explanationBusiness:
      'Browser zeigen eine Warnung, wenn Besucher Ihre Seite aufrufen. Studien zeigen, dass viele Nutzer dann sofort wegklicken. Außerdem rankt Google Websites ohne HTTPS schlechter – Sie werden weniger gefunden.',
    impactLabel: 'schlechter Google-Rang, verliert Anfragen',
    fixEffort: 'medium',
  },
  'technical-no-ssl': {
    titleBusiness: 'Website wird als "Nicht sicher" angezeigt',
    explanationBusiness:
      'Browser zeigen eine Warnung, wenn Besucher Ihre Seite aufrufen. Studien zeigen, dass viele Nutzer dann sofort wegklicken. Außerdem rankt Google Websites ohne HTTPS schlechter – Sie werden weniger gefunden.',
    impactLabel: 'schlechter Google-Rang, verliert Anfragen',
    fixEffort: 'medium',
  },
  'large-images': {
    titleBusiness: 'Seite lädt zu langsam',
    explanationBusiness:
      'Bilder sind zu groß und verlangsamen die Seite erheblich. Besucher warten zu lange, bevor sie den Inhalt sehen. Erfahrungsgemäß springen viele Nutzer dann ab, bevor sie anfragen. Das kostet potenzielle Aufträge – besonders auf dem Handy.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'technical-large-images': {
    titleBusiness: 'Seite lädt zu langsam',
    explanationBusiness:
      'Bilder sind zu groß und verlangsamen die Seite erheblich. Besucher warten zu lange, bevor sie den Inhalt sehen. Erfahrungsgemäß springen viele Nutzer dann ab, bevor sie anfragen. Das kostet potenzielle Aufträge – besonders auf dem Handy.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'technical-large-pages': {
    titleBusiness: 'Seite lädt zu langsam',
    explanationBusiness:
      'Die Seiten sind zu groß und laden sehr langsam. Besucher warten über mehrere Sekunden, bevor sie den Inhalt sehen. Erfahrungsgemäß springen viele Nutzer dann ab, bevor sie anfragen. Das kostet potenzielle Aufträge – besonders auf dem Handy.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'technical-large-html-size': {
    titleBusiness: 'Seite lädt zu langsam',
    explanationBusiness:
      'Die HTML-Datei ist sehr groß, was die Ladezeit erheblich verlangsamt. Besucher warten zu lange, bevor sie den Inhalt sehen. Erfahrungsgemäß springen viele Nutzer dann ab, bevor sie anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'technical-excessive-scripts': {
    titleBusiness: 'Zu viele externe Skripte verlangsamen die Seite',
    explanationBusiness:
      'Die Website lädt sehr viele externe Dateien, was die Ladezeit deutlich erhöht. Besucher warten zu lange, bevor sie den Inhalt sehen. Erfahrungsgemäß springen viele Nutzer dann ab, bevor sie anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'hard',
  },
  'technical-console-errors': {
    titleBusiness: 'Technische Fehler beeinträchtigen die Funktionalität',
    explanationBusiness:
      'JavaScript-Fehler auf der Website können dazu führen, dass Funktionen nicht richtig arbeiten. Besucher können möglicherweise Formulare nicht abschicken oder andere wichtige Aktionen nicht ausführen. Das kostet Anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'hard',
  },
  'missing-responsive-meta': {
    titleBusiness: 'Website funktioniert schlecht auf dem Handy',
    explanationBusiness:
      'Die Website ist nicht für Mobilgeräte optimiert. Über 70% der Besucher kommen über das Handy – wenn die Seite dort schlecht aussieht, gehen sie zur Konkurrenz. Das kostet massiv Anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'technical-missing-responsive-meta': {
    titleBusiness: 'Website funktioniert schlecht auf dem Handy',
    explanationBusiness:
      'Die Website ist nicht für Mobilgeräte optimiert. Über 70% der Besucher kommen über das Handy – wenn die Seite dort schlecht aussieht, gehen sie zur Konkurrenz. Das kostet massiv Anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'technical-missing-canonical': {
    titleBusiness: 'Google kann Ihre Seite nicht optimal einordnen',
    explanationBusiness:
      'Ohne Canonical-Tag weiß Google nicht, welche Version Ihrer Seite die Hauptversion ist. Das kann dazu führen, dass Ihre Seite schlechter rankt oder doppelte Inhalte abgestraft werden.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'technical-unoptimized-images': {
    titleBusiness: 'Bilder verlangsamen die Seite',
    explanationBusiness:
      'Bilder sind nicht optimiert und verlangsamen die Ladezeit erheblich. Besucher warten zu lange, bevor sie den Inhalt sehen. Erfahrungsgemäß springen viele Nutzer dann ab, bevor sie anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'technical-long-redirect-chains': {
    titleBusiness: 'Umleitungen verlangsamen die Seite',
    explanationBusiness:
      'Zu viele Umleitungen führen dazu, dass Besucher länger warten müssen, bis sie auf der richtigen Seite ankommen. Das kann Anfragen kosten und wirkt sich negativ auf das Google-Ranking aus.',
    impactLabel: 'verliert Anfragen, schlechter Google-Rang',
    fixEffort: 'medium',
  },
  'technical-http-version-hint': {
    titleBusiness: 'Veraltete HTTP-Version kann Sicherheit beeinträchtigen',
    explanationBusiness:
      'Die Website nutzt eine ältere HTTP-Version. Das kann Sicherheitsprobleme verursachen und dazu führen, dass Browser Warnungen anzeigen. Besucher könnten dann wegklicken.',
    impactLabel: 'Abmahnrisiko, verliert Anfragen',
    fixEffort: 'hard',
  },

  // SEO Issues
  'missing-title': {
    titleBusiness: 'Google zeigt Ihre Seite nicht richtig an',
    explanationBusiness:
      'Ihre Seite hat keinen Titel, der in den Suchergebnissen angezeigt wird. Google kann Ihre Seite nicht richtig einordnen – Sie ranken schlechter und werden weniger gefunden. Das kostet potenzielle Kunden.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'seo-missing-title': {
    titleBusiness: 'Google zeigt Ihre Seite nicht richtig an',
    explanationBusiness:
      'Ihre Seite hat keinen Titel, der in den Suchergebnissen angezeigt wird. Google kann Ihre Seite nicht richtig einordnen – Sie ranken schlechter und werden weniger gefunden. Das kostet potenzielle Kunden.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'seo-title-length': {
    titleBusiness: 'Titel werden in Google abgeschnitten',
    explanationBusiness:
      'Die Seitentitel sind zu lang oder zu kurz. In den Google-Suchergebnissen werden sie abgeschnitten, wodurch wichtige Informationen fehlen. Potenzielle Kunden sehen dann nicht, worum es geht.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'missing-meta-description': {
    titleBusiness: 'Google zeigt keine Beschreibung Ihrer Seite',
    explanationBusiness:
      'Ihre Seiten haben keine Beschreibung für die Google-Suchergebnisse. Besucher sehen dann nur die URL statt einer ansprechenden Beschreibung – die Klickrate sinkt deutlich. Sie verlieren potenzielle Anfragen.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'seo-missing-meta-description': {
    titleBusiness: 'Google zeigt keine Beschreibung Ihrer Seite',
    explanationBusiness:
      'Ihre Seiten haben keine Beschreibung für die Google-Suchergebnisse. Besucher sehen dann nur die URL statt einer ansprechenden Beschreibung – die Klickrate sinkt deutlich. Sie verlieren potenzielle Anfragen.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'seo-meta-description-length': {
    titleBusiness: 'Beschreibungen werden in Google abgeschnitten',
    explanationBusiness:
      'Die Beschreibungen Ihrer Seiten sind zu lang oder zu kurz. In den Google-Suchergebnissen werden sie abgeschnitten, wodurch wichtige Informationen fehlen. Potenzielle Kunden sehen dann nicht, worum es geht.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'multiple-h1': {
    titleBusiness: 'Google kann Ihre Seite nicht richtig verstehen',
    explanationBusiness:
      'Mehrere Hauptüberschriften verwirren Google. Die Suchmaschine weiß nicht, welcher Inhalt am wichtigsten ist. Das kann dazu führen, dass Ihre Seite schlechter rankt.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'seo-multiple-h1': {
    titleBusiness: 'Google kann Ihre Seite nicht richtig verstehen',
    explanationBusiness:
      'Mehrere Hauptüberschriften verwirren Google. Die Suchmaschine weiß nicht, welcher Inhalt am wichtigsten ist. Das kann dazu führen, dass Ihre Seite schlechter rankt.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'seo-missing-h1': {
    titleBusiness: 'Google weiß nicht, worum es auf Ihrer Seite geht',
    explanationBusiness:
      'Ihre Seite hat keine Hauptüberschrift. Google kann dann nicht erkennen, welches der wichtigste Inhalt ist. Das führt zu schlechterem Ranking und weniger Sichtbarkeit.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'no-robots-txt': {
    titleBusiness: 'Google crawlt Ihre Seite nicht optimal',
    explanationBusiness:
      'Google findet keine robots.txt Datei. Suchmaschinen können dann nicht optimal durch Ihre Website navigieren, was zu schlechterer Indexierung führt.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'no-sitemap-xml': {
    titleBusiness: 'Google findet nicht alle Ihre Seiten',
    explanationBusiness:
      'Ohne Sitemap weiß Google nicht, welche Seiten auf Ihrer Website existieren. Neue oder weniger verlinkte Seiten werden möglicherweise nicht gefunden und ranken dann gar nicht.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'seo-missing-sitemap': {
    titleBusiness: 'Google findet nicht alle Ihre Seiten',
    explanationBusiness:
      'Ohne Sitemap weiß Google nicht, welche Seiten auf Ihrer Website existieren. Neue oder weniger verlinkte Seiten werden möglicherweise nicht gefunden und ranken dann gar nicht.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'seo-duplicate-titles': {
    titleBusiness: 'Mehrere Seiten haben den gleichen Titel',
    explanationBusiness:
      'Mehrere Seiten verwenden denselben Titel. Google weiß dann nicht, welche Seite für welche Suchanfrage relevant ist. Das führt zu schlechterem Ranking für beide Seiten.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'medium',
  },
  'seo-low-word-count': {
    titleBusiness: 'Seiten haben zu wenig Inhalt',
    explanationBusiness:
      'Ihre Seiten haben sehr wenig Text. Google bevorzugt Seiten mit ausreichend Inhalt. Zu wenig Text führt zu schlechterem Ranking und weniger Sichtbarkeit.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'medium',
  },
  'seo_missing_canonical': {
    titleBusiness: 'Google kann Ihre Seite nicht optimal einordnen',
    explanationBusiness:
      'Ohne Canonical-Tag weiß Google nicht, welche Version Ihrer Seite die Hauptversion ist. Das kann dazu führen, dass Ihre Seite schlechter rankt oder doppelte Inhalte abgestraft werden.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },
  'seo_missing_og_tags': {
    titleBusiness: 'Website sieht in Social Media schlecht aus',
    explanationBusiness:
      'Wenn jemand Ihre Website in WhatsApp, Facebook oder anderen Messengern teilt, sieht es unprofessionell aus. Das wirkt sich negativ auf das Vertrauen aus und kann Anfragen kosten.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'seo_missing_lang_attr': {
    titleBusiness: 'Google erkennt die Sprache nicht richtig',
    explanationBusiness:
      'Ihre Website hat kein Sprachattribut. Google weiß dann nicht, für welche Sprache die Seite optimiert ist. Das kann zu schlechterem Ranking führen.',
    impactLabel: 'schlechter Google-Rang',
    fixEffort: 'easy',
  },

  // Legal Issues
  'no-impressum': {
    titleBusiness: 'Fehlendes Impressum – Abmahnrisiko',
    explanationBusiness:
      'Für deutsche Websites ist ein Impressum gesetzlich Pflicht. Fehlt es, drohen teure Abmahnungen von spezialisierten Anwaltskanzleien. Diese können schnell mehrere hundert Euro kosten.',
    impactLabel: 'Abmahnrisiko',
    fixEffort: 'easy',
  },
  'legal-missing-impressum': {
    titleBusiness: 'Fehlendes Impressum – Abmahnrisiko',
    explanationBusiness:
      'Für deutsche Websites ist ein Impressum gesetzlich Pflicht. Fehlt es, drohen teure Abmahnungen von spezialisierten Anwaltskanzleien. Diese können schnell mehrere hundert Euro kosten.',
    impactLabel: 'Abmahnrisiko',
    fixEffort: 'easy',
  },
  'no-datenschutz': {
    titleBusiness: 'Fehlende Datenschutzerklärung – Abmahnrisiko',
    explanationBusiness:
      'Seit der DSGVO ist eine Datenschutzerklärung bei jeder Datenerhebung Pflicht. Fehlt sie, drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes. Auch Abmahnungen sind möglich.',
    impactLabel: 'Abmahnrisiko',
    fixEffort: 'easy',
  },
  'legal-missing-privacy': {
    titleBusiness: 'Fehlende Datenschutzerklärung – Abmahnrisiko',
    explanationBusiness:
      'Seit der DSGVO ist eine Datenschutzerklärung bei jeder Datenerhebung Pflicht. Fehlt sie, drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes. Auch Abmahnungen sind möglich.',
    impactLabel: 'Abmahnrisiko',
    fixEffort: 'easy',
  },
  'no-cookie-banner': {
    titleBusiness: 'Fehlender Cookie-Hinweis – Abmahnrisiko',
    explanationBusiness:
      'Wenn Ihre Website Cookies verwendet (z.B. für Google Analytics), ist ein Cookie-Banner mit Einwilligung gesetzlich Pflicht. Fehlt er, drohen Abmahnungen. Diese können schnell mehrere hundert Euro kosten.',
    impactLabel: 'Abmahnrisiko',
    fixEffort: 'medium',
  },
  'legal-missing-cookie-banner': {
    titleBusiness: 'Fehlender Cookie-Hinweis – Abmahnrisiko',
    explanationBusiness:
      'Wenn Ihre Website Cookies verwendet (z.B. für Google Analytics), ist ein Cookie-Banner mit Einwilligung gesetzlich Pflicht. Fehlt er, drohen Abmahnungen. Diese können schnell mehrere hundert Euro kosten.',
    impactLabel: 'Abmahnrisiko',
    fixEffort: 'medium',
  },
  'google-fonts-remote': {
    titleBusiness: 'Google Fonts können datenschutzrechtlich problematisch sein',
    explanationBusiness:
      'Google Fonts werden von externen Servern geladen. Dabei werden IP-Adressen an Google übertragen, was datenschutzrechtlich problematisch sein kann. Das kann zu Abmahnungen führen.',
    impactLabel: 'Abmahnrisiko',
    fixEffort: 'medium',
  },
  'legal-external-fonts-warning': {
    titleBusiness: 'Externe Fonts können datenschutzrechtlich problematisch sein',
    explanationBusiness:
      'Fonts werden von externen Servern geladen. Dabei werden IP-Adressen an Dritte übertragen, was datenschutzrechtlich problematisch sein kann. Das kann zu Abmahnungen führen.',
    impactLabel: 'Abmahnrisiko',
    fixEffort: 'medium',
  },

  // UX Issues
  'phone-not-clickable': {
    titleBusiness: 'Telefonnummern sind nicht direkt anrufbar',
    explanationBusiness:
      'Besucher können die Telefonnummern auf dem Handy nicht einfach antippen. Sie müssen die Nummer abtippen oder kopieren – viele geben dann auf. Studien zeigen, dass klickbare Nummern deutlich mehr Anrufe generieren.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'no-opening-hours': {
    titleBusiness: 'Keine Öffnungszeiten gefunden',
    explanationBusiness:
      'Besucher finden keine Öffnungszeiten. Lokale Kunden wissen dann nicht, wann Sie erreichbar sind und rufen möglicherweise nicht an oder gehen zur Konkurrenz.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'no-cta-button': {
    titleBusiness: 'Besucher wissen nicht, was sie tun sollen',
    explanationBusiness:
      'Ihre Website hat keine klare Handlungsaufforderung (z.B. "Jetzt kontaktieren", "Anfrage stellen"). Besucher wissen dann nicht, welchen nächsten Schritt sie machen sollen und gehen oft wieder weg.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'ux_missing_primary_cta': {
    titleBusiness: 'Besucher wissen nicht, was sie tun sollen',
    explanationBusiness:
      'Ihre Website hat keine klare Handlungsaufforderung (z.B. "Jetzt kontaktieren", "Anfrage stellen"). Besucher wissen dann nicht, welchen nächsten Schritt sie machen sollen und gehen oft wieder weg.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'no-contact-page': {
    titleBusiness: 'Kunden können Sie nicht einfach kontaktieren',
    explanationBusiness:
      'Es gibt keine eigene Kontaktseite. Besucher müssen lange suchen, um Ihre Kontaktdaten zu finden. Viele geben dann auf und gehen zur Konkurrenz. Das kostet potenzielle Anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'no-google-maps': {
    titleBusiness: 'Standort ist nicht auf einen Blick sichtbar',
    explanationBusiness:
      'Für lokale Unternehmen ist eine Kartenansicht wichtig. Besucher können sofort sehen, wo Sie sind und wie sie hinkommen. Fehlt sie, verlieren Sie potenzielle Kunden, die in der Nähe suchen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'ux_outdated_design': {
    titleBusiness: 'Veraltetes Design wirkt unprofessionell',
    explanationBusiness:
      'Die Website sieht veraltet aus. Besucher schließen daraus, dass auch Ihr Unternehmen veraltet ist – selbst wenn das nicht stimmt. Studien zeigen, dass moderne Websites deutlich mehr Vertrauen und Anfragen generieren.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'hard',
  },
  'ux_missing_viewport': {
    titleBusiness: 'Website funktioniert schlecht auf dem Handy',
    explanationBusiness:
      'Die Website ist nicht für Mobilgeräte optimiert. Über 70% der Besucher kommen über das Handy – wenn die Seite dort schlecht aussieht, gehen sie zur Konkurrenz. Das kostet massiv Anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'ux_mobile_overflow': {
    titleBusiness: 'Website ist auf dem Handy nicht benutzbar',
    explanationBusiness:
      'Auf dem Handy läuft der Inhalt über den Bildschirmrand. Besucher müssen horizontal scrollen, was sehr mühsam ist. Die meisten geben dann auf und gehen zur Konkurrenz.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'ux_small_font_sizes': {
    titleBusiness: 'Text ist auf dem Handy zu klein',
    explanationBusiness:
      'Die Schriftgröße ist zu klein, besonders auf Mobilgeräten. Besucher können den Text nicht gut lesen und geben oft auf. Das kostet potenzielle Anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'ux_long_text_lines': {
    titleBusiness: 'Textzeilen sind zu lang zum Lesen',
    explanationBusiness:
      'Textzeilen sind so lang, dass sie schwer zu lesen sind. Besucher müssen den Kopf hin und her bewegen oder verlieren die Zeile. Das führt dazu, dass viele aufhören zu lesen und weggehen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'ux_multiple_h1': {
    titleBusiness: 'Seite ist schwer zu überblicken',
    explanationBusiness:
      'Mehrere Hauptüberschriften verwirren Besucher. Sie wissen nicht, wo sie anfangen sollen zu lesen. Das führt dazu, dass viele aufgeben und weggehen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'ux_missing_hierarchy': {
    titleBusiness: 'Seite ist schwer zu überblicken',
    explanationBusiness:
      'Die Überschriftenstruktur ist unklar. Besucher können nicht schnell erfassen, worum es geht und wo wichtige Informationen sind. Das kostet potenzielle Anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'ux_overloaded_navigation': {
    titleBusiness: 'Navigation ist überladen',
    explanationBusiness:
      'Die Navigation hat zu viele Menüpunkte. Besucher sind überfordert und finden nicht, was sie suchen. Das führt dazu, dass viele aufgeben und zur Konkurrenz gehen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'ux_low_contrast': {
    titleBusiness: 'Text ist schwer lesbar',
    explanationBusiness:
      'Die Farben haben zu wenig Kontrast, der Text ist schwer zu lesen. Besucher müssen sich anstrengen und geben oft auf. Das kostet potenzielle Anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'ux_inconsistent_buttons': {
    titleBusiness: 'Buttons sehen unterschiedlich aus',
    explanationBusiness:
      'Buttons haben unterschiedliche Farben und Formen. Das wirkt unprofessionell und verwirrt Besucher. Studien zeigen, dass einheitliche Buttons zu mehr Klicks führen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'ux_outdated_ui_patterns': {
    titleBusiness: 'Design wirkt veraltet',
    explanationBusiness:
      'Die Website nutzt veraltete Design-Patterns. Das wirkt unprofessionell und Besucher schließen daraus, dass auch das Unternehmen veraltet ist. Modernes Design generiert deutlich mehr Vertrauen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'hard',
  },
  'ux_no_https': {
    titleBusiness: 'Website wird als "Nicht sicher" angezeigt',
    explanationBusiness:
      'Browser zeigen eine Warnung, wenn Besucher Ihre Seite aufrufen. Studien zeigen, dass viele Nutzer dann sofort wegklicken. Außerdem rankt Google Websites ohne HTTPS schlechter.',
    impactLabel: 'schlechter Google-Rang, verliert Anfragen',
    fixEffort: 'medium',
  },
  'ux_mixed_content': {
    titleBusiness: 'Browser zeigen Sicherheitswarnungen',
    explanationBusiness:
      'Ihre Website lädt unsichere Inhalte, auch wenn sie HTTPS nutzt. Browser zeigen dann Warnungen, die Besucher abschrecken. Das kostet potenzielle Anfragen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'ux_missing_social_proof': {
    titleBusiness: 'Fehlende Bewertungen oder Referenzen',
    explanationBusiness:
      'Es gibt keine Bewertungen, Referenzen oder Testimonials. Studien zeigen, dass sozialer Beweis (z.B. Bewertungen) zu deutlich mehr Anfragen führt. Ohne diesen fehlt Vertrauen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'ux_spa_without_ssr': {
    titleBusiness: 'Seite lädt sehr langsam beim ersten Aufruf',
    explanationBusiness:
      'Die Seite ist als Single-Page-App gebaut, aber nicht für schnelles Laden optimiert. Besucher warten zu lange beim ersten Aufruf. Erfahrungsgemäß springen viele dann ab.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'hard',
  },
  'ux_slow_performance': {
    titleBusiness: 'Seite lädt zu langsam',
    explanationBusiness:
      'Die Website lädt sehr langsam. Besucher warten über mehrere Sekunden, bevor sie den Inhalt sehen. Erfahrungsgemäß springen viele Nutzer dann ab, bevor sie anfragen. Das kostet potenzielle Aufträge.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'hard',
  },
  'ux_hero_without_value_proposition': {
    titleBusiness: 'Besucher wissen nicht, was Sie anbieten',
    explanationBusiness:
      'Die Startseite erklärt nicht klar, was Sie anbieten und warum Besucher bei Ihnen kaufen sollen. Besucher wissen dann nicht, ob Sie das Richtige für sie sind und gehen oft weg.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'medium',
  },
  'ux_missing_contact_info': {
    titleBusiness: 'Kontaktdaten sind schwer zu finden',
    explanationBusiness:
      'Besucher finden Telefonnummer, E-Mail oder Adresse nicht schnell. Sie müssen lange suchen oder geben auf. Das kostet potenzielle Anfragen – besonders auf dem Handy.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'ux_forms_without_labels': {
    titleBusiness: 'Formulare sind schwer auszufüllen',
    explanationBusiness:
      'Formularfelder haben keine Beschriftungen. Besucher wissen nicht, was sie eintragen sollen. Das führt dazu, dass viele das Formular nicht abschicken oder Fehler machen.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
  'ux_missing_favicon': {
    titleBusiness: 'Website wirkt unprofessionell in Browser-Tabs',
    explanationBusiness:
      'Ihre Website hat kein Favicon (kleines Icon in Browser-Tabs). Das wirkt unprofessionell und macht es schwerer, Ihre Seite in geöffneten Tabs wiederzufinden.',
    impactLabel: 'verliert Anfragen',
    fixEffort: 'easy',
  },
}

/**
 * Gets business-friendly explanation for an issue
 * Returns null if no mapping exists
 */
export function getIssueExplanation(
  issueId: string
): IssueExplanation | null {
  return issueExplanationMap[issueId] || null
}

/**
 * Gets all known issue IDs
 */
export function getAllIssueIds(): string[] {
  return Object.keys(issueExplanationMap)
}

