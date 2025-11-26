'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4">
            <article className="prose prose-slate">
              <h1>Datenschutzerklärung</h1>

              <h2>1. Datenschutz auf einen Blick</h2>
              <p>
                <strong>Allgemeine Hinweise:</strong> Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit
                Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle
                Daten, mit denen Sie persönlich identifiziert werden können.
              </p>
              <p>
                <strong>Datenerfassung auf dieser Website:</strong>
              </p>
              <ul>
                <li>
                  <strong>Wer ist verantwortlich?</strong> Die Datenverarbeitung auf dieser Website erfolgt durch den
                  Websitebetreiber (siehe Impressum).
                </li>
                <li>
                  <strong>Wie erfassen wir Ihre Daten?</strong> Ihre Daten werden zum einen dadurch erhoben, dass Sie uns
                  diese mitteilen (z. B. durch das Eingeben einer URL in den Scanner oder die Buchung über Calendly). Andere
                  Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst (z. B. technische Daten wie
                  Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
                </li>
                <li>
                  <strong>Wofür nutzen wir Ihre Daten?</strong> Ein Teil der Daten wird erhoben, um eine fehlerfreie
                  Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens
                  verwendet werden.
                </li>
              </ul>

              <h2>2. Hosting (Vercel)</h2>
              <p>Wir hosten die Inhalte unserer Website bei folgendem Anbieter:</p>
              <p>
                <strong>Vercel Inc.</strong>
                <br />
                340 S Lemon Ave #4133
                <br />
                Walnut, CA 91789, USA
              </p>
              <p>
                Vercel ist ein Dienst zur Bereitstellung von Websites. Wenn Sie unsere Website besuchen, erfasst Vercel
                verschiedene Logfiles inklusive Ihrer IP-Adresse.
              </p>
              <p>
                Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes
                Interesse an einer möglichst zuverlässigen Darstellung unserer Website. Die Datenübertragung in die USA wird
                auf die Standardvertragsklauseln der EU-Kommission gestützt.
              </p>

              <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
              <p>
                <strong>Datenschutz:</strong> Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr
                ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen
                Datenschutzvorschriften.
              </p>
              <p>
                <strong>Hinweis zur verantwortlichen Stelle:</strong>
                <br />
                Marcus van Dinther &amp; Luis Hammann SiteSweep GbR
                <br />
                Dubliner Weg 4
                <br />
                50259 Pulheim
                <br />
                E-Mail: info@sitesweep.de
              </p>

              <h2>4. Datenerfassung auf dieser Website</h2>
              <p>
                <strong>Kontaktanfragen:</strong> Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre Anfrage
                inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres
                Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
              </p>
              <p>
                <strong>Calendly (Terminbuchung):</strong> Auf unserer Website haben Sie die Möglichkeit, Termine mit uns zu
                vereinbaren. Wir nutzen hierfür den Dienst Calendly (Calendly LLC, 271 17th St NW, 10th Floor, Atlanta,
                Georgia 30363, USA).
              </p>
              <p>
                Zum Zwecke der Terminbuchung geben Sie die abgefragten Daten und den Wunschtermin in die Maske ein. Diese
                Daten werden zur Planung, Durchführung und ggf. zur Nachbereitung des Termins verwendet. Die Rechtsgrundlage
                ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) bzw. unser berechtigtes Interesse an einer effizienten
                Terminplanung.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

