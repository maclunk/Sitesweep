'use client'

import { Search, ShieldCheck, Banknote, MapPin, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function UeberUnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-slate-900 text-white py-20 md:py-28 overflow-hidden">
          {/* Subtle geometric pattern background */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
          
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              Ehrliche Technik statt teurem Marketing.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto"
            >
              Warum wir SiteSweep gegründet haben: Digitalisierung für den Mittelstand – transparent, fair und aus der Region.
            </motion.p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 text-center">
                Unsere Mission
              </h2>
              <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
                <p>
                  In einer Welt voller überteuerter Agenturen und komplizierter Baukästen haben kleine und mittlere Unternehmen oft das Nachsehen. Egal ob Anwalt, Arzt, Makler oder Händler: Viele zahlen tausende Euro für Websites, die technisch veraltet sind oder rechtliche Risiken bergen. Wir haben SiteSweep gegründet, um Professionalität bezahlbar zu machen. Objektive Analyse, mathematische Präzision und faire Festpreise.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center">
                  <Code2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Wer wir sind
              </h2>
              <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
                <p>
                  Wir sind Marcus und Luis, zwei Mathematik-Studenten der RWTH Aachen. Als "Digital Natives" sind wir mit dem Code aufgewachsen, den das moderne Internet antreibt. Wir verbinden analytisches Denken mit praktischer Umsetzung. Während klassische Agenturen oft noch alte Systeme verkaufen, setzen wir auf moderne Standards (wie Next.js und React), die schneller, sicherer und langlebiger sind.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Principles Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center"
            >
              Unsere Prinzipien
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Card 1: Objektivität */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Objektivität
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Unsere Analyse basiert auf harten technischen Fakten, nicht auf Bauchgefühl. Wenn Ihre Website gut ist, sagen wir Ihnen das. Wenn sie kritische Fehler hat, zeigen wir diese auf.
                </p>
              </motion.div>

              {/* Card 2: Eigentum statt Miete */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Eigentum statt Miete
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Wir glauben, dass Ihre Website Ihnen gehören sollte. Bei uns gibt es keine monatlichen Mietkosten für das Design. Nach der Übergabe gehört der Code zu 100 % Ihnen.
                </p>
              </motion.div>

              {/* Card 3: Transparenz statt Stundensätze */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-4">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Transparenz statt Stundensätze
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Niemand kauft gerne die Katze im Sack. Deshalb arbeiten wir nicht nach undurchsichtigen Stundenlöhnen, sondern nach festen Projektpreisen. Sie wissen vorher auf den Cent genau, was es kostet.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust & Location Section */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Standort & Verantwortung
              </h2>
              <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
                <p>
                  Software "Made in Germany" ist für uns kein Werbespruch, sondern Haltung. Unsere Server stehen in Deutschland, wir achten penibel auf Datenschutz (DSGVO) und sind für unsere Kunden persönlich ansprechbar – hier vor Ort und nicht in einem Callcenter.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Lernen Sie uns kennen.
              </h2>
              <a
                href="https://calendly.com/sitesweep-info/analyse"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors shadow-lg"
              >
                Kostenloses Analyse-Gespräch buchen
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
