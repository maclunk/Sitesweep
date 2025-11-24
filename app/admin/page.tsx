'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { DashboardSkeleton } from '@/components/admin/LoadingSkeleton'
import Link from 'next/link'

interface DashboardData {
  kpis: {
    scansToday: number
    scansThisWeek: number
    openLeads: number
    avgScoreLast7Days: number
  }
  queueStatus: {
    pending: number
    running: number
    failed: number
  }
  recentScans: Array<{
    id: string
    url: string
    label: string | null
    status: string
    createdAt: string
    finishedAt: string | null
    score: number | null
  }>
}

export default function AdminPage() {
  const searchParams = useSearchParams()
  const secret = searchParams.get('secret')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (!secret) {
      setAccessDenied(true)
      setLoading(false)
      return
    }
    fetchDashboard()
  }, [secret])

  const fetchDashboard = async () => {
    if (!secret) return
    
    try {
      const response = await fetch(`/api/admin/dashboard?secret=${encodeURIComponent(secret)}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          setAccessDenied(true)
          setLoading(false)
          return
        }
        throw new Error(`HTTP ${response.status}: Fehler beim Laden der Dashboard-Daten`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        setDashboardData(data.data)
      } else {
        throw new Error('Ungültige Antwort vom Server')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Dashboard-Daten'
      setError(errorMessage)
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
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

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-400'
    if (score < 70) return 'text-red-600'
    if (score < 90) return 'text-yellow-600'
    return 'text-green-600'
  }

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength - 3) + '...'
  }

  // Zugriff verweigert
  if (accessDenied) {
    return (
      <>
        <AdminHeader title="Zugriff verweigert" />
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-red-900 mb-4">Zugriff verweigert</h2>
            <p className="text-slate-600 mb-4">
              Sie haben keinen Zugriff auf diese Seite. Bitte verwenden Sie das korrekte Secret in der URL.
            </p>
            <p className="text-sm text-slate-500">
              Beispiel: /admin?secret=IHRE_SECRET
            </p>
          </div>
        </div>
      </>
    )
  }

  // Loading
  if (loading) {
    return (
      <>
        <AdminHeader title="Dashboard" subtitle="Lade Daten..." />
        <div className="p-6">
          <DashboardSkeleton />
        </div>
      </>
    )
  }

  // Error
  if (error) {
    return (
      <>
        <AdminHeader title="Dashboard" />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-red-900 mb-2">Fehler</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </>
    )
  }

  if (!dashboardData) {
    return null
  }

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="Systemübersicht und Business-Funnel"
        actions={
          <Link
            href={`/admin/scans?secret=${encodeURIComponent(secret || '')}`}
            className="px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
          >
            Alle Scans anzeigen
          </Link>
        }
      />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-sm text-slate-600 mb-1">Scans heute</p>
            <p className="text-3xl font-bold text-slate-900">{dashboardData.kpis.scansToday}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-sm text-slate-600 mb-1">Scans diese Woche</p>
            <p className="text-3xl font-bold text-slate-900">{dashboardData.kpis.scansThisWeek}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-sm text-slate-600 mb-1">Offene Leads</p>
            <p className="text-3xl font-bold text-slate-900">{dashboardData.kpis.openLeads}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-sm text-slate-600 mb-1">Ø Score (7 Tage)</p>
            <p className="text-3xl font-bold text-slate-900">
              {dashboardData.kpis.avgScoreLast7Days > 0 ? dashboardData.kpis.avgScoreLast7Days : '–'}
            </p>
          </div>
        </div>

        {/* Queue Status Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Queue Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{dashboardData.queueStatus.pending}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="text-sm text-blue-700 font-medium">Running</p>
                <p className="text-2xl font-bold text-blue-900">{dashboardData.queueStatus.running}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="text-sm text-red-700 font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-900">{dashboardData.queueStatus.failed}</p>
              </div>
              {dashboardData.queueStatus.failed > 0 && (
                <Link
                  href={`/admin/scans?secret=${encodeURIComponent(secret || '')}&status=error`}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Retry
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Neueste Scans Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Neueste Scans</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Zeitpunkt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dashboardData.recentScans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Keine Scans gefunden
                    </td>
                  </tr>
                ) : (
                  dashboardData.recentScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(scan.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={scan.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-sky-600 hover:text-sky-700 block truncate max-w-md"
                          title={scan.url}
                        >
                          {scan.label || truncateUrl(scan.url)}
                        </a>
                        {scan.label && (
                          <span className="text-xs text-slate-500 truncate max-w-md block">
                            {truncateUrl(scan.url)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {scan.score !== null ? (
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getScoreColor(scan.score)}`}>
                            {scan.score} / 100
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">–</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                          {getStatusLabel(scan.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/jobs/${scan.id}?secret=${encodeURIComponent(secret || '')}`}
                          className="px-3 py-1.5 text-xs font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
