'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface BatchJob {
  id: string
  url: string
  status: string
  createdAt: string
  finishedAt: string | null
  error: string | null
  result: {
    score: number
    summary: string
    issues: any[]
  } | null
}

export default function BatchResultsPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.batchId as string

  const [secret, setSecret] = useState<string | null>(null)
  const [jobs, setJobs] = useState<BatchJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

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

  useEffect(() => {
    if (!autoRefresh || !secret || accessDenied) return

    const interval = setInterval(() => {
      fetchBatchJobs(secret)
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, secret, accessDenied, batchId])

  const fetchBatchJobs = async (secretParam: string) => {
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
        setJobs(data.data.jobs)
      } else if (Array.isArray(data.jobs)) {
        setJobs(data.jobs)
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

  const getScoreColor = (score: number | null): string => {
    if (score === null) return 'text-slate-500'
    if (score < 50) return 'text-red-600 font-bold'
    if (score < 80) return 'text-yellow-600 font-semibold'
    return 'text-green-600'
  }

  const getScoreBgColor = (score: number | null): string => {
    if (score === null) return 'bg-slate-100'
    if (score < 50) return 'bg-red-50'
    if (score < 80) return 'bg-yellow-50'
    return 'bg-green-50'
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

  // Sort jobs: worst score first, then pending/error at bottom
  const sortedJobs = [...jobs].sort((a, b) => {
    const scoreA = a.result?.score ?? null
    const scoreB = b.result?.score ?? null

    // Jobs with scores come first (sorted ascending - worst first)
    if (scoreA !== null && scoreB !== null) {
      return scoreA - scoreB
    }
    if (scoreA !== null) return -1
    if (scoreB !== null) return 1

    // Both have no score - sort by createdAt
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const allDone = jobs.every(job => job.status === 'done' || job.status === 'error')
  const doneCount = jobs.filter(job => job.status === 'done').length
  const errorCount = jobs.filter(job => job.status === 'error').length
  const pendingCount = jobs.filter(job => job.status === 'pending' || job.status === 'running').length

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-10">
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
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <a
            href={`/admin/bulk-scan?secret=${encodeURIComponent(secret || '')}`}
            className="text-sm text-slate-600 hover:text-sky-600 transition-colors"
          >
            ← Zurück zum Massenscan
          </a>
          <button
            onClick={() => secret && fetchBatchJobs(secret)}
            disabled={loading}
            className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Lädt...' : 'Aktualisieren'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Batch-Ergebnisse
          </h1>
          <p className="text-slate-600 mb-4">Batch-ID: <code className="text-sm bg-slate-100 px-2 py-1 rounded">{batchId}</code></p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-900">{jobs.length}</div>
              <div className="text-sm text-slate-600">Gesamt</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">{doneCount}</div>
              <div className="text-sm text-green-600">Abgeschlossen</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-700">{pendingCount}</div>
              <div className="text-sm text-yellow-600">Ausstehend</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-700">{errorCount}</div>
              <div className="text-sm text-red-600">Fehler</div>
            </div>
          </div>

          {/* Auto-refresh toggle */}
          {!allDone && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Automatische Aktualisierung (alle 5 Sekunden)
              </label>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            <strong>Fehler:</strong> {error}
          </div>
        )}

        {loading && jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-600">Lade Batch-Ergebnisse...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-600">Keine Jobs in diesem Batch gefunden.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Rang</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">URL</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Erstellt</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Fertig</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedJobs.map((job, index) => {
                    const score = job.result?.score ?? null
                    const statusBadge = getStatusBadge(job.status)
                    const criticalIssues = job.result?.issues?.filter((issue: any) => issue.severity === 'high').length || 0

                    return (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {score !== null ? `#${index + 1}` : '–'}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-sky-600 hover:text-sky-700 hover:underline break-all"
                          >
                            {job.url}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          {score !== null ? (
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getScoreBgColor(score)} ${getScoreColor(score)} font-bold text-lg`}>
                              {score}
                            </div>
                          ) : (
                            <span className="text-slate-400">–</span>
                          )}
                          {criticalIssues > 0 && score !== null && (
                            <div className="text-xs text-red-600 mt-1">
                              {criticalIssues} kritisch
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {new Date(job.createdAt).toLocaleString('de-DE')}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {job.finishedAt ? new Date(job.finishedAt).toLocaleString('de-DE') : '–'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

