'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Globe } from 'lucide-react'

interface FormData {
  email: string
  currentWebsite: string
  consent: boolean
}

export default function DomainRadarForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    currentWebsite: '',
    consent: false,
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.consent) {
      setErrorMessage('Bitte stimmen Sie der Benachrichtigung zu.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/newsletter-signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          Vielen Dank!
        </h3>
        <p className="text-slate-600 text-lg mb-2 max-w-md mx-auto">
          Bitte bestätigen Sie kurz die E-Mail in Ihrem Postfach, um die Benachrichtigungen zu aktivieren.
        </p>
        <p className="text-slate-500 text-sm">
          Keine E-Mail erhalten? Prüfen Sie Ihren Spam-Ordner.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-4">
          <Globe className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Sichern Sie sich Premium-Adressen in Ihrer Region.
        </h2>
        <p className="text-slate-600 text-base max-w-lg mx-auto leading-relaxed mb-3">
          Gute Internet-Adressen sind selten. Wir benachrichtigen Sie sofort, wenn eine passende Domain für Ihre Branche frei wird.
        </p>
        <p className="text-slate-700 font-medium text-base">
          Mehr Kunden durch bessere Auffindbarkeit – vollautomatisch.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
            Ihre E-Mail-Adresse <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ihre@email.de"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Current Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-semibold text-slate-900 mb-2">
            Ihre aktuelle Website <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            id="website"
            value={formData.currentWebsite}
            onChange={(e) => setFormData({ ...formData, currentWebsite: e.target.value })}
            placeholder="z.B. www.maler-mueller.de"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            Hilft uns, passende Domains für Ihre Branche und Region zu finden.
          </p>
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-slate-700 leading-relaxed">
              Ja, benachrichtigen Sie mich bei freien Domains in meiner Region.
            </span>
          </label>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Wird eingetragen...
            </>
          ) : (
            'Kostenlos eintragen'
          )}
        </button>

        {/* Trust Text */}
        <p className="text-center text-xs text-slate-500 pt-2">
          Kein Spam. Keine Werbung. Nur eine Nachricht, wenn eine relevante Domain frei wird.
        </p>
      </form>
    </div>
  )
}
