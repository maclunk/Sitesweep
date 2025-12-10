'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DomainRadarForm from '@/components/DomainRadarForm'

export default function DomainRadarPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <DomainRadarForm />
          
          {/* Additional Info Section */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Wie funktioniert es?
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Eintragen</h4>
                <p className="text-sm text-slate-600">Sie hinterlassen Ihre E-Mail-Adresse und Ihre aktuelle Website.</p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Wir überwachen</h4>
                <p className="text-sm text-slate-600">Unser System prüft automatisch, welche Domains in Ihrer Region frei werden.</p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-lg">✓</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Benachrichtigung</h4>
                <p className="text-sm text-slate-600">Sie erhalten eine E-Mail, sobald eine passende Domain verfügbar ist.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16 bg-white rounded-2xl border border-slate-200 p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
              Häufige Fragen
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Kostet das etwas?</h4>
                <p className="text-sm text-slate-600">Nein, die Benachrichtigung ist kostenlos. Erst wenn Sie eine Domain registrieren möchten, entstehen die normalen Domain-Gebühren (ca. 10-30€/Jahr).</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Warum sind alte Domains wertvoll?</h4>
                <p className="text-sm text-slate-600">Internet-Adressen, die bereits existiert haben, werden von Google oft besser gefunden. Das spart Zeit beim Aufbau Ihrer Online-Präsenz.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Kann ich mich jederzeit abmelden?</h4>
                <p className="text-sm text-slate-600">Ja, jederzeit per Klick in der E-Mail oder per Nachricht an uns.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
