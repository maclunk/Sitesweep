'use client'

import React, { useState } from 'react'
import { Scan, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DomainRadarPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    industry: '',
    consent: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.consent) {
      return
    }

    setLoading(true)
    
    // Simulate API call to prevent build crash on missing route
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/newsletter-signup', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData),
    // })
    
    setLoading(false)
    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-20 pb-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 relative">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-6">
                <Scan className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                Der Regionale Domain-Radar
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Sichern Sie sich den SEO-Vorteil, bevor es die Konkurrenz tut. Wir überwachen frei werdende Premium-Domains in Ihrer Branche.
              </p>
            </div>

            {/* The Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl shadow-blue-900/10">
              
              {success ? (
                <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Radar aktiviert!</h3>
                  <p className="text-slate-400">Wir haben Ihre Anfrage erhalten. Bitte bestätigen Sie kurz den Link in der E-Mail, die wir Ihnen gerade gesendet haben.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Ihr Name</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Max Mustermann"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">E-Mail Adresse <span className="text-red-400">*</span></label>
                      <input 
                        required 
                        type="email" 
                        placeholder="kanzlei@muster.de"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Stadt / Region</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="z.B. Aachen"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Branche</label>
                      <select 
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none"
                      >
                        <option value="">Branche auswählen...</option>
                        <option value="recht-kanzlei">Recht & Kanzlei</option>
                        <option value="medizin-gesundheit">Medizin & Gesundheit</option>
                        <option value="handwerk-bau">Handwerk & Bau</option>
                        <option value="handel-kfz">Handel & Kfz</option>
                        <option value="gastronomie">Gastronomie</option>
                        <option value="dienstleistung">Dienstleistung</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-4">
                    <input 
                      required 
                      id="consent" 
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-500" 
                    />
                    <label htmlFor="consent" className="text-xs text-slate-500 leading-snug">
                      Ja, ich möchte benachrichtigt werden, wenn eine Domain in meiner Nische frei wird. Ich stimme zu, gelegentlich Tipps zur Web-Optimierung von SiteSweep zu erhalten. (Jederzeit kündbar).
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
                    {loading ? 'Aktiviere Radar...' : 'Kostenlose Überwachung starten'}
                  </button>
                </form>
              )}
            </div>

            {/* Trust Footer */}
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500 mb-4 font-medium uppercase tracking-wider">Warum alte Domains?</p>
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center text-slate-400 text-sm">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Starke Backlinks
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Sofortiges Google-Ranking
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Schutz vor Konkurrenz
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
