'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import Link from 'next/link'

interface ScanJob {
  id: string
  url: string
  status: string
  createdAt: string
  finishedAt: string | null
  error: string | null
  batchId?: string | null
  label?: string | null
  result: {
    score: number
    summary: string
    issues: any[]
  } | null
}

export default function AdminScansPage() {
  const searchParams = useSearchParams()
  const secret = searchParams.get('secret')
  const [jobs, setJobs] = useState<ScanJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!secret) {
      setError('Zugriff verweigert. Secret fehlt.')
      setLoading(false)
      return
    }
    fetchJobs(secret)
  }, [secret])

  const fetchJobs = async (secretParam: string) => {
    try {
      const response = await fetch(`/api/admin/jobs?secret=${encodeURIComponent(secretParam)}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Zugriff verweigert. Ungültiges Secret.')
          setLoading(false)
          return
        }
        throw new Error(`HTTP ${response.status}: Fehler beim Laden der Jobs`)
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
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Jobs'
      setError(errorMessage)
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700'
      case 'running':
        return 'bg-blue-100 text-blue-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'error':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
        return 'Fertig'
      case 'running':
        return 'Läuft'
      case 'pending':
        return 'Wartend'
      case 'error':
        return 'Fehler'
      default:
        return status
    }
  }

  const getScoreColor = (score: number) => {
    if (score < 70) return 'text-red-600'
    if (score < 90) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <>
        <AdminHeader title="Scans" subtitle="Alle Website-Scans im Überblick" />
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            <p className="mt-4 text-slate-600">Lade Scans...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <AdminHeader title="Scans" subtitle="Alle Website-Scans im Überblick" />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-red-900 mb-2">Fehler</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title="Scans"
        subtitle={`${jobs.length} Scan(s) insgesamt`}
        actions={
          <Link
            href={`/admin?secret=${encodeURIComponent(secret || '')}`}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Zurück zum Dashboard
          </Link>
        }
      />
      <div className="p-6">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-slate-600">Keine Scans gefunden</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Erstellt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-sky-600 hover:text-sky-700 truncate max-w-md"
                          >
                            {job.label || job.url}
                          </a>
                          {job.label && (
                            <span className="text-xs text-slate-500 truncate max-w-md">
                              {job.url}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {getStatusLabel(job.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {job.result ? (
                          <span
                            className={`text-sm font-semibold ${getScoreColor(
                              job.result.score
                            )}`}
                          >
                            {job.result.score} / 100
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">–</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {job.result && (
                            <Link
                              href={`/admin/jobs/${job.id}?secret=${encodeURIComponent(secret || '')}`}
                              className="px-3 py-1.5 text-xs font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                            >
                              Details
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

