'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LeadBatchScanPage() {
  const [secret, setSecret] = useState<string | null>(null)
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [limit, setLimit] = useState(50)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    leadSearchJobId: string
    leadsCreated: number
    scanJobsCreated: number
    totalLeadsFound: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const secretParam = params.get('secret')
      setSecret(secretParam)

      if (!secretParam) {
        setAccessDenied(true)
        return
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category.trim() || !city.trim() || !secret) {
      setError('Bitte füllen Sie alle Felder aus')
      return
    }

    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/admin/lead-batch-scan/start?secret=${encodeURIComponent(secret)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: category.trim(),
          city: city.trim(),
          limit: limit > 0 ? limit : 50,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setAccessDenied(true)
          return
        }
        throw new Error(data.error || 'Fehler beim Starten der Suche')
      }

      if (data.success && data.data) {
        setResult(data.data)
      } else {
        throw new Error('Ungültige Antwort vom Server')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Starten der Suche'
      setError(errorMessage)
      console.error('Error starting lead batch scan:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Zugriff verweigert</h1>
            <p className="text-slate-600">Bitte geben Sie den korrekten Admin-Secret an.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <a
            href={`/admin?secret=${encodeURIComponent(secret || '')}`}
            className="text-sm text-slate-600 hover:text-sky-600 transition-colors"
          >
            ← Zurück zur Admin-Übersicht
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            KMU-Suche & Scans starten
          </h1>
          <p className="text-slate-600 mb-8">
            Geben Sie Branche und Stadt ein. Der KMU-Finder sucht automatisch passende Firmen, und für alle gefundenen Websites werden Scan-Jobs erstellt.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                Branche *
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="z. B. Maler, Zahnarzt, Physiotherapie"
                required
                disabled={submitting}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">
                Stadt *
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="z. B. Köln, Berlin, München"
                required
                disabled={submitting}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-slate-700 mb-2">
                Limit (Anzahl Leads)
              </label>
              <input
                type="number"
                id="limit"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
                min="1"
                max="500"
                disabled={submitting}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-slate-500">Standard: 50</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <strong>Fehler:</strong> {error}
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold mb-2">Suche erfolgreich abgeschlossen!</p>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• {result.totalLeadsFound} Leads gefunden</p>
                  <p>• {result.leadsCreated} Leads in Datenbank gespeichert</p>
                  <p>• {result.scanJobsCreated} Scan-Jobs erstellt</p>
                  <p className="mt-3 font-semibold">LeadSearchJob-ID: {result.leadSearchJobId}</p>
                </div>
                <div className="mt-4">
                  <a
                    href={`/admin/lead-batch-scan/${result.leadSearchJobId}?secret=${encodeURIComponent(secret || '')}`}
                    className="inline-block px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
                  >
                    Ergebnisse ansehen →
                  </a>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !category.trim() || !city.trim()}
              className="w-full px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Suche läuft...' : 'KMU-Suche & Scans starten'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

