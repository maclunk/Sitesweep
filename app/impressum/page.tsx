import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <article className="prose prose-slate prose-lg max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">Impressum</h1>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Angaben gemäß § 5 TMG</h2>
          
          <p className="text-lg mb-6">
            <strong>Marcus van Dinther & Luis Hammann SiteSweep GbR</strong><br />
            Dubliner Weg 4<br />
            50259 Pulheim
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Vertreten durch die Gesellschafter:</h2>
          <p className="text-lg">
            Marcus van Dinther<br />
            Luis Hammann
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Kontakt</h2>
          <p className="text-lg">
            <strong>Telefon:</strong> <a href="tel:+4915679739925" className="text-primary hover:underline">+49 15679 739925</a><br />
            <strong>E-Mail:</strong> <a href="mailto:info@sitesweep.de" className="text-primary hover:underline">info@sitesweep.de</a>
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Umsatzsteuer-ID</h2>
          <p className="text-lg">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
            <strong>DE458520625</strong>
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Redaktionell verantwortlich</h2>
          <p className="text-lg">
            Marcus van Dinther & Luis Hammann<br />
            Dubliner Weg 4<br />
            50259 Pulheim
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">EU-Streitschlichtung</h2>
          <p className="text-lg">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a 
              href="https://ec.europa.eu/consumers/odr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            .<br />
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
          <p className="text-lg">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </article>
      </main>
      
      <Footer />
    </div>
  )
}

