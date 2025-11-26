'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import ScanProgress from '@/components/ScanProgress'
import AuditReport from '@/components/AuditReport'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getCalendlyLink } from '@/lib/calendly'
import { BenchmarkComparison } from '@/components/BenchmarkComparison'
import StickyCta from '@/components/StickyCta'
import { Search, ArrowRight, Gauge, ShieldCheck, Layout } from 'lucide-react'

interface Issue {
  id: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  category?: 'security' | 'legal' | 'gdpr' | 'seo' | 'technical' | 'ux'
  pages?: string[]
}

interface ScanResult {
  status: string
  score?: number
  summary?: string
  issues?: Issue[]
  error?: string
  mobileScreenshotUrl?: string | null
  screenshot?: string | null
  techStack?: string[]
  industry?: string | null
  city?: string | null
  competitorName?: string | null
  url?: string | null
  lowHangingFruit?: {
    issue: any
    rule: string
  } | null
}

// Trust Badge Icons (einfache SVG-Icons) - außerhalb der Komponente für Stabilität
const ShieldIcon = () => (
  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const ServerIcon = () => (
  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
)

const GraduationCapIcon = () => (
  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" />
  </svg>
)

// URL Input Component - außerhalb der Home-Komponente für Stabilität
interface UrlInputSectionProps {
  url: string
  setUrl: (url: string) => void
  isScanning: boolean
  loading: boolean
  error: string | null
  onStartScan: () => void
  showHint?: boolean
}

const UrlInputSection = ({
  url,
  setUrl,
  isScanning,
  loading,
  error,
  onStartScan,
  showHint = true,
}: UrlInputSectionProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isScanning && !loading && url.trim()) {
      onStartScan()
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={handleUrlChange}
          placeholder="Ihre Website-Adresse (z. B. https://mein-unternehmen.de)"
          disabled={isScanning || loading}
          autoComplete="url"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          aria-label="Website-URL eingeben"
          className="flex-1 px-5 py-3.5 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed text-base min-h-[44px]"
        />
        <button
          type="submit"
          disabled={isScanning || loading || !url.trim()}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0F766E] text-white font-semibold rounded-full hover:bg-[#0D5D56] transition-all shadow-soft hover:shadow-soft-lg disabled:bg-slate-400 disabled:cursor-not-allowed whitespace-nowrap text-base relative z-10 cursor-pointer min-h-[44px]"
          style={{ backgroundColor: isScanning || loading || !url.trim() ? '#94a3b8' : '#0F766E' }}
        >
          {loading ? 'Wird gestartet...' : (
            <>
              Website prüfen
              <Search className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    
      {/* Trust-Badges - Pill Style */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
        <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 px-4 py-2 shadow-soft">
          <ShieldIcon />
          <span className="text-slate-600">100% anonym & diskret</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 px-4 py-2 shadow-soft">
          <ServerIcon />
          <span className="text-slate-600">Serverstandort Deutschland</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 px-4 py-2 shadow-soft">
          <GraduationCapIcon />
          <span className="text-slate-600">Technologie aus Aachen</span>
        </div>
      </div>
      
      <p className="text-base text-slate-800 text-center font-medium mt-4 max-w-2xl mx-auto">
        Geben Sie Ihre Website-Adresse ein, um herauszufinden, wie viele neue Kunden Sie über Ihre Website gewinnen könnten.
      </p>
      
      {showHint && (
        <p className="text-sm text-slate-600 text-center mt-2">
          Unverbindlich testen – Sie erhalten einen klar verständlichen Kurzreport.
        </p>
      )}
      
      <p className="text-xs text-slate-500 text-center mt-2 max-w-2xl mx-auto">
        Die Umsetzung erfolgt nach Ihren Wünschen – Stil, Farben und Funktionen stimmen wir vorab gemeinsam ab.
      </p>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <strong>Fehler:</strong> {error}
        </div>
      )}
    </form>
  )
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Reset State beim Navigieren zur Homepage
  useEffect(() => {
    if (pathname === '/') {
      // Reset alle States beim Zurückkehren zur Homepage
      setUrl('')
      setLoading(false)
      setIsScanning(false)
      setResult(null)
      setError(null)
      console.log('[Frontend] Homepage - State zurückgesetzt')
    }
  }, [pathname])

  // Reset State auch bei Custom Event (Logo-Klick auf Homepage)
  useEffect(() => {
    const handleReset = () => {
      setUrl('')
      setLoading(false)
      setIsScanning(false)
      setResult(null)
      setError(null)
      console.log('[Frontend] Homepage - State zurückgesetzt (Logo-Klick)')
    }

    window.addEventListener('resetHomepage', handleReset)
    return () => window.removeEventListener('resetHomepage', handleReset)
  }, [])

  // Debug: Prüfe ob Komponente geladen wird
  useEffect(() => {
    console.log('[Frontend] Home component mounted')
  }, [])

  const startScan = async () => {
    console.log('[Frontend] startScan called, url:', url)
    
    // Validierung
    if (!url.trim()) {
      console.log('[Frontend] URL is empty')
      setError('Bitte geben Sie eine URL ein')
      return
    }

    // Normalisiere URL (füge https:// hinzu falls fehlt)
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    // Aktualisiere URL im State mit normalisierter Version
    setUrl(normalizedUrl)
    setError(null)
    setResult(null)
    setLoading(true)
    setIsScanning(true)

    try {
      console.log('[Frontend] Starting scan for URL:', normalizedUrl)
      
      // Send request and await full response (synchronous flow)
      const response = await fetch('/api/scan/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Fehler beim Starten des Scans`)
      }

      const data = await response.json()
      console.log('[Frontend] Scan response:', data)

      // Extract result data - handle both response formats
      const resultData = data.success && data.data ? data.data : data
      
      // Check if we have a complete result
      if (resultData.status === 'done' || resultData.score !== undefined) {
        setResult({
          status: resultData.status || 'done',
          score: resultData.score || 0,
          summary: resultData.summary || '',
          issues: Array.isArray(resultData.issues) ? resultData.issues : [],
          mobileScreenshotUrl: resultData.mobileScreenshotUrl || null,
          screenshot: resultData.screenshot || resultData.mobileScreenshotUrl || null,
          techStack: Array.isArray(resultData.techStack) ? resultData.techStack : [],
          industry: resultData.industry || null,
          city: resultData.city || null,
          competitorName: resultData.competitorName || null,
          url: resultData.url || normalizedUrl || null,
          lowHangingFruit: resultData.lowHangingFruit || null,
        })
      } else if (resultData.error) {
        throw new Error(resultData.error)
      } else {
        throw new Error('Ungültige Antwort vom Scanner-Service')
      }

      setLoading(false)
      setIsScanning(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Starten des Scans'
      setError(errorMessage)
      setLoading(false)
      setIsScanning(false)
      console.error('[Frontend] Error starting scan:', err)
    }
  }

  return (
    <div className="min-h-screen bg-bg-soft">
      <Header />
      
    <main>
        {/* Scan Progress - nur während des Scannens */}
        {isScanning && (
          <div className="max-w-4xl mx-auto px-4 py-10">
            <ScanProgress isActive={isScanning} />
          </div>
        )}

        {/* Ergebnis-Seite - wenn Scan fertig */}
        {result && result.status === 'done' && (
          <div className="max-w-6xl mx-auto px-4 py-10">
            {/* New Professional Audit Report */}
            <AuditReport 
              score={result.score || 0}
              summary={result.summary}
              screenshot={result.screenshot || result.mobileScreenshotUrl}
              techStack={result.techStack}
              issues={result.issues || []}
              url={result.url || url}
            />

            {/* Benchmark Comparison - Optional */}
            {result.industry && result.city && (
              <div className="mt-8">
                <BenchmarkComparison
                  industry={result.industry}
                  city={result.city}
                  yourScore={result.score || 0}
                  competitorName={result.competitorName || null}
                />
              </div>
            )}
          </div>
        )}

        {/* Neue Landingpage - wenn kein Ergebnis und nicht am Scannen */}
        {!result && !isScanning && (
          <div className="space-y-16 md:space-y-24">
            {/* 1. Hero-Bereich mit Gradient Background */}
            <section className="relative bg-gradient-hero py-16 md:py-24 overflow-hidden" id="scan-section">
              <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="space-y-6 text-center">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                    Gewinnt Ihre Website genügend Kunden?
                  </h1>
                  <p className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed">
                    Der kostenlose Check für Kanzleien, Praxen, Handel & KMU. Finden Sie heraus, was Sie ändern können, um mehr Anfragen zu bekommen und mehr Aufträge zu gewinnen.
                  </p>
                  <p className="text-base text-slate-700 leading-relaxed">
                    Scan kostenlos, Ergebnis sofort, keine Verpflichtung. Wir zeigen Ihnen konkret, wie Sie mehr Besucher zu Kunden machen.
                  </p>
                  
                  {/* Scanner Input - Centerpiece */}
                  <div id="scan-form" className="mt-8">
                    <UrlInputSection
                      url={url}
                      setUrl={setUrl}
                      isScanning={isScanning}
                      loading={loading}
                      error={error}
                      onStartScan={startScan}
                      showHint={true}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. "Was wir prüfen" - Feature Sections als professionelle Audit-Kategorien */}
            <section className="max-w-6xl mx-auto px-4 space-y-8 py-16">
              {/* Kategorie 1: Sichtbarkeit & SEO */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Search className="w-6 h-6 text-slate-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
                      Sichtbarkeit & Google
                    </h2>
                    <p className="text-sm text-slate-600 mb-4">
                      Bessere Platzierung bei Google führt zu mehr Besuchern und mehr Anfragen
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">Meta-Tags und Titel</p>
                        <p className="text-sm text-slate-600">Gute Titel in den Google-Suchergebnissen bringen mehr Besucher auf Ihre Seite</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">Strukturierte Überschriften</p>
                        <p className="text-sm text-slate-600">Klare Überschriften helfen Google, Ihre Seite besser zu verstehen. Das bringt mehr Besucher.</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">Alt-Texte für Bilder</p>
                        <p className="text-sm text-slate-600">Bilder mit Beschreibungen helfen Google, Ihre Seite besser zu finden. Das bringt mehr Besucher.</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">Robots.txt und Sitemap</p>
                        <p className="text-sm text-slate-600">Richtige Einstellungen sorgen dafür, dass Google alle wichtigen Seiten findet.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kategorie 2: Technischer Zustand */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Gauge className="w-6 h-6 text-slate-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
                      Technischer Zustand
                    </h2>
                    <p className="text-sm text-slate-600 mb-4">
                      Schnelle Ladezeiten und saubere Technik sorgen dafür, dass Besucher bleiben und nicht sofort wegklicken
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">Ladezeiten und Performance</p>
                        <p className="text-sm text-slate-600">Schnelle Seiten halten Besucher länger – mehr Zeit, um sie zu Kunden zu machen</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">404-Fehler und defekte Links</p>
                        <p className="text-sm text-slate-600">Funktionierende Links führen Besucher zu Ihren Angeboten statt zu Fehlerseiten</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">SSL-Verschlüsselung</p>
                        <p className="text-sm text-slate-600">Sichere Verbindungen schaffen Vertrauen. Ohne sie warnen Browser Besucher, was viele abschreckt.</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">Fehlerhafte Bilder und Ressourcen</p>
                        <p className="text-sm text-slate-600">Vollständige Inhalte wirken seriös und halten Besucher auf der Seite</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600">
                        <strong className="text-slate-900">Recht & Datenschutz:</strong> Impressum, DSGVO und Cookie-Konformität werden ebenfalls geprüft – wichtig für Vertrauen und rechtliche Sicherheit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kategorie 3: UX & Design */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Layout className="w-6 h-6 text-slate-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
                      UX & Design
                    </h2>
                    <p className="text-sm text-slate-600 mb-4">
                      Einfache Bedienung und klare Buttons führen zu mehr Anfragen und Bestellungen
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">Klarer Call-to-Action</p>
                        <p className="text-sm text-slate-600">Klare Buttons wie 'Jetzt anfragen' führen Besucher direkt zum Kontakt</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">Klare Wege zum Kontakt</p>
                        <p className="text-sm text-slate-600">Logische Struktur, damit Besucher einfach zu Kunden werden</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">Klickbare Kontaktdaten</p>
                        <p className="text-sm text-slate-600">Klickbare Telefonnummern und E-Mail-Adressen machen Kontaktaufnahme so einfach wie möglich</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-slate-900 mb-1">Mobile Nutzer optimal abholen</p>
                        <p className="text-sm text-slate-600">Optimierung für Handys sorgt dafür, dass auch Smartphone-Nutzer problemlos zu Kunden werden</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Final CTA Band - Base44 Style */}
            <section className="bg-gradient-cta py-16 md:py-20">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Kostenlose Analyse buchen
                </h2>
                <p className="text-lg md:text-xl font-medium text-slate-800 mb-8 max-w-2xl mx-auto">
                  In einem persönlichen Gespräch besprechen wir konkrete Maßnahmen, wie Sie mehr Anfragen und Aufträge über Ihre Website bekommen.
                </p>
                <a
                  href={getCalendlyLink('')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#0F766E] text-white font-semibold rounded-full text-lg hover:bg-[#0D5D56] transition-all shadow-soft-lg hover:shadow-soft min-h-[48px]"
                >
                  Jetzt Termin buchen
                  <ArrowRight className="w-5 h-5" />
                </a>
                <p className="text-sm text-slate-700 mt-6 font-medium">
                  Scan ist kostenlos. Gespräch unverbindlich.
                </p>
              </div>
            </section>

            {/* 6. FAQ-Sektion */}
            <section className="max-w-4xl mx-auto px-4 py-16">
              <div className="bg-white rounded-2xl shadow-soft border border-slate-200/50 p-6 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-slate-900">
                  Häufige Fragen
                </h2>
                
                <div className="max-w-prose mx-auto space-y-5">
                  {[
                  {
                    question: 'Ist der Website-Check wirklich kostenlos?',
                    answer: (
                      <>
                        Ja. Der Check ist zu 100 % kostenlos und unverbindlich.<br /><br />
                        Sie geben Ihre Website-Adresse ein und erhalten das Ergebnis direkt im Anschluss. Es entsteht kein Abo, kein versteckter Vertrag und keine automatische Verlängerung. Eine weitere Zusammenarbeit ist nicht erforderlich.
                      </>
                    ),
                  },
                  {
                    question: 'Was passiert mit meinen Daten – wird irgendetwas gespeichert oder gemeldet?',
                    answer: (
                      <>
                        Wir prüfen ausschließlich öffentlich sichtbare Inhalte Ihrer Website – so wie ein normaler Besucher oder Google das auch tun könnte. Die Analyse dient nur Ihrem eigenen Schutz und Ihrer Optimierung.<br /><br />
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Wir melden keine Auffälligkeiten an Behörden oder Abmahnvereine.</li>
                          <li>Wir greifen nicht auf interne Bereiche (Logins, Kundendaten o. Ä.) zu.</li>
                          <li>Auf Wunsch löschen wir Ihre Scan-Ergebnisse vollständig aus unserem System.</li>
                        </ul>
                        <br />
                        Kurz gesagt: Der Check ist anonym & diskret und wird nicht gegen Sie verwendet.
                      </>
                    ),
                  },
                  {
                    question: 'Muss ich Technik-Wissen haben, um das Ergebnis zu verstehen?',
                    answer: (
                      <>
                        Nein. Sie brauchen keinerlei Fachwissen.<br /><br />
                        Der technische Teil läuft im Hintergrund automatisch. Für Sie bereiten wir alles in klarer, verständlicher Form auf:<br /><br />
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>ein Gesamt-Score (0–100) mit Ampel-System</li>
                          <li>konkrete Möglichkeiten für mehr Kunden auf einen Blick</li>
                          <li>praktische Empfehlungen, wie Sie mehr Besucher zu Kunden machen</li>
                        </ul>
                        <br />
                        Auf Wunsch besprechen wir die Ergebnisse mit Ihnen in einem persönlichen Gespräch und zeigen Ihnen, welche Maßnahmen zu den meisten Anfragen und Aufträgen führen.
                      </>
                    ),
                  },
                  {
                    question: 'Seid ihr eine teure Agentur mit langen Verträgen?',
                    answer: (
                      <>
                        Nein. Wir sind ein spezialisiertes Team, das sich darauf konzentriert, kleinen und mittleren Unternehmen zu mehr Kunden zu verhelfen.<br /><br />
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Kein riesiger Agentur-Overhead</li>
                          <li>Keine langen, intransparenten Verträge</li>
                          <li>Stattdessen: klare Analysen und Festpreise für konkrete Maßnahmen, die zu mehr Kunden führen</li>
                        </ul>
                        <br />
                        Sie entscheiden in Ruhe, ob Sie nach dem Check etwas umsetzen lassen möchten – oder nicht.
                      </>
                    ),
                  },
                  {
                    question: 'Wie lange dauert der Website-Check?',
                    answer: (
                      <>
                        In der Regel nur wenige Minuten.<br /><br />
                        Abhängig von Umfang und Geschwindigkeit Ihrer Website kann es etwas variieren. Sie sehen nach dem Start direkt, dass Ihre Seite geprüft wird, und erhalten das Ergebnis, sobald der Scan abgeschlossen ist.
                      </>
                    ),
                  },
                  {
                    question: 'Muss ich Zugangsdaten oder Passwörter herausgeben?',
                    answer: (
                      <>
                        Nein, niemals.<br /><br />
                        Für den Check benötigen wir nur die öffentliche Adresse Ihrer Website (z. B. www.meine-firma.de). Wir fragen keine Passwörter, kein Hosting-Login und keine internen Kundendaten ab.<br /><br />
                        Wenn Sie sich später entscheiden, Optimierungen von uns durchführen zu lassen, besprechen wir gemeinsam den sichersten Weg – z. B. über temporäre Zugänge oder Zusammenarbeit mit Ihrem bestehenden Webmaster.
                      </>
                    ),
                  },
                  {
                    question: 'Ist das rechtlich sicher für mich?',
                    answer: (
                      <>
                        Wir sind keine Kanzlei und geben keine Rechtsberatung. Unser System kann jedoch typische technische Hinweise liefern, z. B.:<br /><br />
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>fehlende oder schwer auffindbare Impressums-/Datenschutzseite</li>
                          <li>fehlender Cookie-Hinweis bei sichtbaren Tracking-Skripten</li>
                          <li>andere Auffälligkeiten, die auf mögliche Risiken hindeuten können</li>
                        </ul>
                        <br />
                        Diese Hinweise ersetzen kein rechtsverbindliches Gutachten. Sie helfen Ihnen aber, Probleme frühzeitig zu erkennen und bei Bedarf mit Ihrem Steuerberater, Anwalt oder Datenschutzbeauftragten zu besprechen.<br /><br />
                        Auf Wunsch unterstützen wir Sie bei der technischen Umsetzung der empfohlenen Maßnahmen (z. B. Einbindung eines Cookie-Banners).
                      </>
                    ),
                  },
                  {
                    question: 'Was passiert nach dem Check – versuchen Sie mir etwas zu verkaufen?',
                    answer: (
                      <>
                        Nach dem Check haben Sie drei Möglichkeiten:<br /><br />
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li><strong>Nur ansehen:</strong> Sie schauen sich das Ergebnis an und setzen die Verbesserungen selbstständig um, um mehr Kunden zu gewinnen.</li>
                          <li><strong>Fragen stellen:</strong> Sie buchen eine kostenlose Analyse (z. B. über unseren Calendly-Link) und wir besprechen gemeinsam, welche Maßnahmen zu den meisten Anfragen führen.</li>
                          <li><strong>Umsetzung beauftragen:</strong> Wenn Sie möchten, machen wir Ihnen ein klares Festpreis-Angebot für Optimierungen, die messbar zu mehr Anfragen und Aufträgen führen.</li>
                        </ol>
                        <br />
                        Es gibt keinen Druck und keine Verpflichtung. Sie entscheiden, ob und wie Sie mit uns zusammenarbeiten möchten.
                      </>
                    ),
                  },
                  {
                    question: 'Kann ich bei der Erstellung oder Überarbeitung mitbestimmen?',
                    answer: (
                      <>
                        Ja. Vor der Umsetzung besprechen wir Ihre Ziele: Welche Art von Kunden möchten Sie gewinnen? Welche Anfragen oder Aufträge sollen steigen? Wir übernehmen die Inhalte und Funktionen Ihrer bisherigen Website und optimieren sie gezielt, damit mehr Besucher zu Kunden werden. Sie geben Feedback in festen Abstimmungsrunden, bis das Ergebnis passt und messbar zu mehr Kunden führt.
                      </>
                    ),
                  },
                ].map((faq, index) => (
                    <div
                      key={index}
                      className={`border rounded-2xl overflow-hidden bg-white transition-all ${
                        openFaqIndex === index 
                          ? 'border-primary shadow-soft-lg' 
                          : 'border-slate-200/50 shadow-soft'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-bg-soft transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset min-h-[60px]"
                        aria-expanded={openFaqIndex === index}
                      >
                        <span className="font-semibold text-lg text-slate-900 pr-4">{faq.question}</span>
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          openFaqIndex === index 
                            ? 'bg-primary text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              openFaqIndex === index ? 'transform rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {openFaqIndex === index && (
                        <div className="px-6 pb-6 pt-2 text-slate-700 text-base leading-relaxed max-w-prose border-t border-slate-100">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
      <StickyCta />
    </div>
  )
}
