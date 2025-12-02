'use client'

import { useState } from 'react'
import { Radar, Send, CheckCircle, AlertCircle, Loader2, Shield, TrendingUp, Globe } from 'lucide-react'

interface FormData {
  name: string
  email: string
  city: string
  industry: string
  consent: boolean
}

const industries = [
  { value: '', label: 'Branche auswählen...' },
  { value: 'recht-kanzlei', label: 'Recht & Kanzlei' },
  { value: 'medizin-gesundheit', label: 'Medizin & Gesundheit' },
  { value: 'handwerk-bau', label: 'Handwerk & Bau' },
  { value: 'handel-kfz', label: 'Handel & Kfz' },
  { value: 'gastronomie', label: 'Gastronomie' },
  { value: 'dienstleistung', label: 'Dienstleistung' },
  { value: 'immobilien', label: 'Immobilien' },
  { value: 'sonstiges', label: 'Sonstiges' },
]

export default function DomainRadarForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    city: '',
    industry: '',
    consent: false,
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.consent) {
      setErrorMessage('Bitte stimmen Sie den Bedingungen zu.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Absenden')
      }

      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Radar aktiviert! 🎯
        </h3>
        <p className="text-slate-300 text-lg mb-6 max-w-md mx-auto">
          Vielen Dank! Bitte bestätigen Sie kurz die E-Mail in Ihrem Postfach, um die Überwachung zu starten.
        </p>
        <p className="text-slate-500 text-sm">
          Keine E-Mail erhalten? Prüfen Sie Ihren Spam-Ordner.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 shadow-2xl border border-slate-700/50">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 mb-5 relative">
          <Radar className="w-8 h-8 text-blue-400" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Der Regionale Konkurrenz-Radar
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
          Wir überwachen für Sie, ob wertvolle Web-Adressen Ihrer Wettbewerber oder Premium-Domains in Ihrer Region frei werden. 
          <span className="text-blue-400 font-medium"> Sichern Sie sich den SEO-Vorteil vor der Konkurrenz.</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Max Mustermann"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            E-Mail <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="max@beispiel.de"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-2">
            Stadt / Region
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="z.B. Aachen, Köln, Eifel"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-slate-300 mb-2">
            Branche
          </label>
          <select
            id="industry"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
          >
            {industries.map((industry) => (
              <option key={industry.value} value={industry.value} className="bg-slate-800">
                {industry.label}
              </option>
            ))}
          </select>
        </div>

        {/* GDPR Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Ja, ich möchte benachrichtigt werden, wenn eine Domain in meiner Nische frei wird, und stimme zu, gelegentlich Tipps zur Web-Optimierung von SiteSweep zu erhalten. 
              <span className="text-slate-500"> (Jederzeit kündbar)</span>
            </span>
          </label>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Wird aktiviert...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Kostenlose Überwachung starten
            </>
          )}
        </button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 pt-4 text-slate-500 text-xs">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            DSGVO-konform
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Kein Spam
          </span>
        </div>
      </form>
    </div>
  )
}

