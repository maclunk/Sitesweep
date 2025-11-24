'use client'

import { useState } from 'react'
import { ShieldCheck, MapPin, MessageCircle, HardHat, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { SliderClientBrief } from '@/components/SliderClientBrief'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: 'Kommen noch Kosten dazu?',
    answer: 'Nein. Die 199 € bzw. 990 € sind Festpreise für den definierten Umfang. Alle genannten Features sind inklusive.',
  },
  {
    question: 'Gehört die Seite mir?',
    answer: 'Ja, zu 100%. Beim Relaunch gibt es keine monatlichen Mietgebühren für das Design. Der Code gehört vollständig Ihnen.',
  },
  {
    question: 'Wie schnell geht das?',
    answer: 'Reparaturen oft in 48h. Ein Relaunch dauert ca. 2 Wochen. Wir halten Sie über den Fortschritt auf dem Laufenden.',
  },
  {
    question: 'Kann ich bei der Erstellung oder Überarbeitung mitbestimmen?',
    answer: 'Ja. Vor der Umsetzung besprechen wir Ihre Wünsche zu Design, Farbwelt, Inhalten und Funktionen. Wir übernehmen die Inhalte und Funktionen Ihrer bisherigen Website und setzen sie in einer modernen, klaren Struktur neu um. Sie geben Feedback in festen Abstimmungsrunden, bis das Ergebnis passt.',
  },
]

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-900">{item.question}</span>
            {openIndex === index ? (
              <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0 ml-4" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0 ml-4" />
            )}
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4 pt-2 border-t border-slate-100">
              <p className="text-slate-600 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function LeistungenPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* 1. Hero Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6"
            >
              Klare Festpreise. Keine versteckten Kosten.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Schluss mit undurchsichtigen Angeboten. Bei uns wissen Sie vorher auf den Cent genau, was Sie bezahlen.
            </motion.p>
          </div>
        </section>

        {/* 2. The Visual Proof (Slider Section) */}
        <section className="py-16 md:py-20 bg-bg-soft">
          <div className="max-w-5xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Sehen Sie den Unterschied.
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Links: Veraltete Technik. Rechts: Der SiteSweep-Standard. Schieben Sie den Regler.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8"
            >
              <BeforeAfterSlider
                beforeSrc="/images/before-after/vorher.png"
                afterSrc="/images/before-after/nachher.png"
                beforeLabel="Vorher"
                afterLabel="Nachher"
                height={600}
              />
              <SliderClientBrief />
            </motion.div>
          </div>
        </section>

        {/* 3. The Main Packages (2-Column Grid) */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Card 1: Das Sicherheits-Paket */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl border-2 border-slate-200 shadow-sm p-8 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-peach/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Das Sicherheits-Paket
                  </h3>
                </div>
                
                <p className="text-slate-600 mb-6">
                  Für bestehende Websites, die rechtlich sicher und technisch in Ordnung sein sollen.
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-slate-900">199 €</span>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">SSL-Verschlüsselung (Sicherheit für Kunden/Mandanten)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Rechtssichere Seiten (Impressum/Datenschutz)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Cookie-Banner (Einwilligung für Cookies)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Behebung technischer Probleme</span>
                  </li>
                </ul>

                <a
                  href="https://calendly.com/sitesweep-info/analyse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-soft hover:shadow-soft-lg text-center inline-block"
                >
                  Reparatur anfragen
                </a>
              </motion.div>

              {/* Card 2: Der Komplett-Neustart (HIGHLIGHTED) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-xl border-2 border-primary shadow-soft-lg p-8 flex flex-col relative"
              >
                {/* Badge "Empfohlen" */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold shadow-soft">
                    Empfohlen
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent-blue/20 flex items-center justify-center">
                    <HardHat className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Der Komplett-Neustart
                  </h3>
                </div>
                
                <p className="text-slate-600 mb-6">
                  Für einen modernen, seriösen Auftritt auf Handy, Tablet und Computer.
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-slate-900">990 €</span>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Komplette Neuerstellung</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Bis zu 5 Unterseiten</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">100% optimiert für Handys</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Sehr schnelle Ladezeiten</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Inklusive aller Sicherheits-Features aus Paket 1</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-semibold">Volles Eigentum (Keine monatlichen Kosten)</span>
                  </li>
                </ul>

                <a
                  href="https://calendly.com/sitesweep-info/analyse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-soft-lg hover:shadow-soft text-center inline-block"
                >
                  Kostenlose Beratung buchen
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4. The Add-ons */}
        <section className="py-16 md:py-20 bg-bg-soft">
          <div className="max-w-6xl mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center"
            >
              Sinnvolle Erweiterungen
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {/* Add-on 1: Google Maps Optimierung */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-peach/20 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Google Maps Einbindung
                </h3>
                <div className="text-2xl font-bold text-slate-900 mb-4">
                  + 199 €
                </div>
                <p className="text-slate-600 flex-grow">
                  Perfekt, damit Sie lokal gefunden werden (z.B. "Anwalt Köln", "Autohaus Müller" oder "Zahnarzt Aachen").
                </p>
              </motion.div>

              {/* Add-on 2: WhatsApp-Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-peach/20 to-accent-lime/20 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Termin- & Kontakt-Buttons
                </h3>
                <div className="text-2xl font-bold text-slate-900 mb-4">
                  + 199 €
                </div>
                <p className="text-slate-600 flex-grow">
                  Integration von WhatsApp, Calendly, Doctolib oder Mobile.de-Links für einfache Erreichbarkeit.
                </p>
              </motion.div>

              {/* Add-on 3: Recruiting-Seite */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-lime/20 to-accent-blue/20 flex items-center justify-center mb-4">
                  <HardHat className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Bewerbungs-Seite
                </h3>
                <div className="text-2xl font-bold text-slate-900 mb-4">
                  + 399 €
                </div>
                <p className="text-slate-600 flex-grow">
                  Ein modernes Schnell-Bewerbungs-Formular ("Bewerben in 60 Sek"). Gegen Fachkräftemangel.
                </p>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-sm text-slate-500 text-center max-w-2xl mx-auto"
            >
              Sie haben einen speziellen Wunsch? (z. B. Logo-Design, Texte oder Online-Termine)? Sprechen Sie uns im Gespräch einfach darauf an.
            </motion.p>
          </div>
        </section>

        {/* 5. The Maintenance Package */}
        <section className="py-16 md:py-20 bg-gradient-cta">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Wartung & Pflege
              </h2>
              <div className="text-5xl md:text-6xl font-bold mb-6">
                29 € <span className="text-2xl md:text-3xl font-normal">/ Monat</span>
              </div>
              <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
                Damit Sie nachts ruhig schlafen können. Wir kümmern uns um Hosting, regelmäßige Updates und Backups. Monatlich kündbar.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center"
            >
              Häufige Fragen
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FAQAccordion items={faqItems} />
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

