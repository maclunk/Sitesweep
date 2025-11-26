'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4">
            <article className="prose prose-slate">
              <h1>Impressum</h1>

              <p>Angaben gemäß § 5 TMG</p>

              <p>
                <strong>Marcus van Dinther &amp; Luis Hammann SiteSweep GbR</strong>
                <br />
                Dubliner Weg 4
                <br />
                50259 Pulheim
              </p>

              <p>
                <strong>Vertreten durch die Gesellschafter:</strong>
                <br />
                Marcus van Dinther
                <br />
                Luis Hammann
              </p>

              <p>
                <strong>Kontakt:</strong>
                <br />
                Telefon: +49 15679 739925
                <br />
                E-Mail: info@sitesweep.de
              </p>

              <p>
                <strong>Umsatzsteuer-ID:</strong>
                <br />
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
                <br />
                Wird nachgereicht.
              </p>

              <p>
                <strong>Redaktionell verantwortlich:</strong>
                <br />
                Marcus van Dinther &amp; Luis Hammann
                <br />
                Dubliner Weg 4
                <br />
                50259 Pulheim
              </p>

              <p>
                <strong>EU-Streitschlichtung:</strong>
                <br />
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
                  https://ec.europa.eu/consumers/odr/
                </a>
                .<br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>

              <p>
                <strong>Verbraucherstreitbeilegung / Universalschlichtungsstelle:</strong>
                <br />
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

