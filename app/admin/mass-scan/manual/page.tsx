'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ManualMassScanPage() {
  const [secret, setSecret] = useState<string | null>(null)
  const [entriesText, setEntriesText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    batchId: string
    totalEntries: number
    validWebsites: number
    scanJobsCreated: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)

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

    if (!entriesText.trim() || !secret) {
      setError('Bitte geben Sie einen JSON-String ein')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/admin/mass-scan/manual?secret=${encodeURIComponent(secret)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entriesText: entriesText.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setAccessDenied(true)
          return
        }
        throw new Error(data.error || 'Unbekannter Fehler')
      }

      if (data.success && data.data) {
        setResult(data.data)
      } else {
        throw new Error('Ungültige Antwort vom Server')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Starten des Massenscans'
      setError(errorMessage)
      console.error('Error starting manual mass scan:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-10">
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
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="mb-6">
          <a
            href={`/admin?secret=${encodeURIComponent(secret || '')}`}
            className="text-sm text-slate-600 hover:text-sky-600 transition-colors"
          >
            ← Zurück zur Admin-Übersicht
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Massenscan (Atlas-JSON)</h1>
          <p className="text-slate-600 mb-8">
            Füge hier den JSON-Output deines Atlas-Prompts ein (Liste schwacher Websites). Für jede gültige Website wird ein ScanJob erstellt.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="entriesText" className="block text-sm font-medium text-slate-700 mb-2">
                Atlas JSON
              </label>
              <textarea
                id="entriesText"
                rows={12}
                value={entriesText}
                onChange={(e) => setEntriesText(e.target.value)}
                disabled={isLoading}
                className="w-full font-mono text-sm border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder='[{"name": "Zahnarztpraxis Müller", "website": "https://zahnarzt-mueller-koeln.de", "city": "Köln", "category": "Zahnarztpraxis", "whyWeak": "Einfache, veraltete Seite."}]'
              />
              <p className="mt-2 text-xs text-slate-500">
                Erwartet wird ein JSON-Array mit Objekten, die mindestens ein "website"-Feld enthalten.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm border border-red-200">
                <strong>Fehler:</strong> {error}
              </div>
            )}

            {result && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 space-y-2">
                <p className="text-sm font-semibold text-slate-900">Massenscan erfolgreich gestartet!</p>
                <div className="text-sm text-slate-700 space-y-1">
                  <p>• Batch-ID: <code className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">{result.batchId}</code></p>
                  <p>• Eingelesene Einträge: {result.totalEntries}</p>
                  <p>• Gültige Websites: {result.validWebsites}</p>
                  <p>• Erstellte ScanJobs: {result.scanJobsCreated}</p>
                </div>
                <div className="pt-3">
                  <a
                    href={`/admin/mass-scan/batch/${result.batchId}?secret=${encodeURIComponent(secret || '')}`}
                    className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                  >
                    Ergebnisse ansehen →
                  </a>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !entriesText.trim()}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Lädt...' : 'Massenscan starten'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

