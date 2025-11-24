'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type BatchScanView = {
  id: string
  url: string
  label?: string | null
  status: string
  score?: number | null
  createdAt: string
  finishedAt?: string | null
  error?: string | null
}

export default function MassScanBatchResultsPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.batchId as string

  const [secret, setSecret] = useState<string | null>(null)
  const [jobs, setJobs] = useState<BatchScanView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const secretParam = urlParams.get('secret')
      setSecret(secretParam)

      if (!secretParam) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      fetchBatchJobs(secretParam)
    }
  }, [batchId])

  const fetchBatchJobs = async (secretParam: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/bulk-scan/${batchId}?secret=${encodeURIComponent(secretParam)}`)

      if (!response.ok) {
        if (response.status === 401) {
          setAccessDenied(true)
          setLoading(false)
          return
        }
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${response.status}: Fehler beim Laden der Batch-Ergebnisse`)
      }

      const data = await response.json()

      if (data.success && data.data && Array.isArray(data.data.jobs)) {
        // Transform to BatchScanView
        const views: BatchScanView[] = data.data.jobs.map((job: any) => ({
          id: job.id,
          url: job.url,
          label: job.label || null,
          status: job.status,
          score: job.result?.score ?? null,
          createdAt: job.createdAt,
          finishedAt: job.finishedAt || null,
          error: job.error || null,
        }))

        // Sort: worst score first
        const withScore = views.filter(v => v.score !== null && v.score !== undefined)
        const withoutScore = views.filter(v => v.score === null || v.score === undefined)

        // Sort withScore by score ascending (worst first)
        withScore.sort((a, b) => (a.score! - b.score!))

        // Combine: worst scores first, then without scores
        const sorted = [...withScore, ...withoutScore]

        setJobs(sorted)
      } else {
        throw new Error('Ungültige Antwort vom Server')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Batch-Ergebnisse'
      setError(errorMessage)
      console.error('Error fetching batch jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (secret) {
      fetchBatchJobs(secret)
    }
  }

  const getScoreColor = (score: number | null | undefined): string => {
    if (score === null || score === undefined) return 'text-slate-500'
    if (score < 50) return 'text-red-600 font-semibold'
    if (score < 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusBadge = (status: string): { text: string; color: string } => {
    switch (status) {
      case 'done':
        return { text: 'Abgeschlossen', color: 'bg-green-100 text-green-800' }
      case 'running':
        return { text: 'Läuft...', color: 'bg-blue-100 text-blue-800' }
      case 'error':
        return { text: 'Fehler', color: 'bg-red-100 text-red-800' }
      default:
        return { text: 'Ausstehend', color: 'bg-slate-100 text-slate-800' }
    }
  }

  const getDomainFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const withScoreCount = jobs.filter(j => j.score !== null && j.score !== undefined).length
  const pendingCount = jobs.filter(j => j.status === 'pending' || j.status === 'running').length
  const errorCount = jobs.filter(j => j.status === 'error').length

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-10">
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
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <a
            href={`/admin/mass-scan/manual?secret=${encodeURIComponent(secret || '')}`}
            className="text-sm text-slate-600 hover:text-sky-600 transition-colors"
          >
            ← Zurück zum Massenscan (Atlas-JSON)
          </a>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Lädt...' : 'Aktualisieren'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Ergebnisse Massenscan</h1>
          <p className="text-sm text-slate-600 mb-6">
            Batch-ID: <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{batchId}</code>
          </p>

          {loading && jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Lade Ergebnisse...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              <strong>Fehler:</strong> {error}
            </div>
          ) : (
            <>
              {/* Zusammenfassung */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-slate-900">{jobs.length}</div>
                  <div className="text-sm text-slate-600">Gesamt</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">{withScoreCount}</div>
                  <div className="text-sm text-green-600">Mit Score</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-700">{pendingCount}</div>
                  <div className="text-sm text-yellow-600">Ausstehend</div>
                </div>
                {errorCount > 0 && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-700">{errorCount}</div>
                    <div className="text-sm text-red-600">Fehler</div>
                  </div>
                )}
              </div>

              {/* Tabelle */}
              {jobs.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <p>Keine ScanJobs für diesen Batch gefunden.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Rang</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Website</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {jobs.map((job, index) => {
                        const statusBadge = getStatusBadge(job.status)
                        const displayName = job.label || getDomainFromUrl(job.url)

                        return (
                          <tr key={job.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {job.score !== null && job.score !== undefined ? `#${index + 1}` : '–'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                              {displayName}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 hover:text-sky-700 hover:underline break-all"
                              >
                                {job.url}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {job.score !== null && job.score !== undefined ? (
                                <span className={getScoreColor(job.score)}>
                                  {job.score}
                                </span>
                              ) : (
                                <span className="text-slate-400">–</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                {statusBadge.text}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

