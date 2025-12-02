import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DomainRadarForm from '@/components/DomainRadarForm'
import { TrendingUp, Globe, Link2, Award, ArrowRight, Newspaper, Building2, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Domain-Radar: Premium-Domains in Ihrer Region überwachen | SiteSweep',
  description: 'Lassen Sie sich benachrichtigen, wenn wertvolle Domains Ihrer Wettbewerber oder Premium-Domains in Ihrer Branche frei werden. Kostenloser Service für KMU.',
}

export default function DomainRadarPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-20 pb-24 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 relative">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium">
                <Star className="w-4 h-4" />
                Exklusiver Service für regionale Unternehmen
              </span>
            </div>

            {/* Form Component */}
            <DomainRadarForm />
          </div>
        </section>

        {/* Trust Section: Warum alte Domains? */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Warum sind alte Domains so wertvoll?
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Eine Domain mit Geschichte ist wie ein Grundstück in bester Lage – der Wert ist bereits da.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Card 1 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <Link2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Bestehende Backlinks</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Domains mit Geschichte haben oft Backlinks von Zeitungen, Branchenverzeichnissen oder anderen seriösen Seiten. Diese Verweise geben Ihrer neuen Website sofort Autorität.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Domain Authority</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Google vertraut älteren Domains mehr. Statt Jahre zu warten, bis Ihre neue Domain Glaubwürdigkeit aufbaut, starten Sie mit einem Vorsprung.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Regionale Keywords</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Domains wie "anwalt-aachen.de" oder "maler-koeln.de" sind Gold wert. Wenn ein Wettbewerber seine Domain aufgibt, können Sie zuschlagen.
                </p>
              </div>
            </div>

            {/* Example Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-blue-100">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <Newspaper className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">
                    Beispiel: Lokale Kanzlei-Domain
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Eine Kanzlei in Aachen gab nach 15 Jahren ihre Domain auf. Die Domain hatte 47 Backlinks von lokalen Nachrichtenportalen, der IHK und Rechtsportalen. 
                    Ein neuer Anwalt übernahm die Domain und rankte innerhalb von 4 Wochen auf Seite 1 für "Anwalt Aachen Erbrecht".
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    → Ohne diese Domain hätte es 12-18 Monate gedauert.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                So funktioniert der Domain-Radar
              </h2>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                  1
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Sie melden sich an</h3>
                  <p className="text-slate-600">Geben Sie Ihre Region und Branche an. Wir richten die Überwachung für Sie ein.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                  2
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Wir überwachen täglich</h3>
                  <p className="text-slate-600">Unser System prüft automatisch, welche Domains in Ihrer Nische auslaufen oder frei werden.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                  3
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Sie erhalten eine Benachrichtigung</h3>
                  <p className="text-slate-600">Sobald eine wertvolle Domain verfügbar wird, informieren wir Sie per E-Mail – inklusive Bewertung und Kaufempfehlung.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                  ✓
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Optional: Wir helfen beim Relaunch</h3>
                  <p className="text-slate-600">Wenn Sie die Domain übernehmen möchten, unterstützen wir Sie bei der Registrierung und beim Aufbau der neuen Website.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-slate-900">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <Building2 className="w-12 h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Verpassen Sie keine Chance mehr
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Jeden Monat werden hunderte wertvolle Domains frei, weil Unternehmen schließen oder vergessen zu verlängern. 
              Seien Sie der Erste, der davon erfährt.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
            >
              Jetzt kostenlos anmelden
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

