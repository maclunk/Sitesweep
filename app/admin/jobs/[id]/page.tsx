'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import Link from 'next/link'
import { 
  ExternalLink, 
  RefreshCw, 
  Download, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  FileDown,
  User,
  Tag
} from 'lucide-react'

import { BenchmarkComparison } from '@/components/BenchmarkComparison'

interface ScanJob {
  id: string
  url: string
  status: string
  createdAt: string
  finishedAt: string | null
  error: string | null
  batchId?: string | null
  label?: string | null
  industry?: string | null
  city?: string | null
  postalCode?: string | null
  companyName?: string | null
  competitorName?: string | null
  lowHangingFruit?: {
    issue: any
    rule: string
  } | null
  result: {
    id: string
    score: number
    scoreRaw?: number | null
    summary: string
    issues: any[]
    scoreBreakdown?: {
      technical?: number
      seo?: number
      legal?: number
      uxDesign?: number
      rawOverall?: number
    } | null
    mobileScreenshotUrl: string | null
    adminNote?: string | null
  } | null
}

type TabType = 'issues' | 'pages' | 'assets' | 'notes'

export default function AdminJobDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobId = params.id as string
  const secret = searchParams.get('secret')

  const [job, setJob] = useState<ScanJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('issues')
  const [adminNote, setAdminNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  
  // Metadata edit form
  const [editingMetadata, setEditingMetadata] = useState(false)
  const [metadataForm, setMetadataForm] = useState({
    industry: '',
    city: '',
    postalCode: '',
    companyName: '',
    competitorName: '',
  })
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [metadataSaved, setMetadataSaved] = useState(false)

  useEffect(() => {
    if (!secret) {
      setAccessDenied(true)
      setLoading(false)
      return
    }
    loadJob()
  }, [jobId, secret])

  const loadJob = async () => {
    if (!secret || !jobId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}?secret=${encodeURIComponent(secret)}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          setAccessDenied(true)
          setLoading(false)
          return
        }
        if (response.status === 404) {
          throw new Error('Job nicht gefunden')
        }
        throw new Error('Fehler beim Laden des Jobs')
      }

      const data = await response.json()
      const jobData = data.success && data.data ? data.data.job : data.job

      if (!jobData) {
        throw new Error('Job nicht gefunden')
      }

      setJob(jobData)
      if (jobData.result?.adminNote) {
        setAdminNote(jobData.result.adminNote)
      }
      // Initialize metadata form
      setMetadataForm({
        industry: jobData.industry || '',
        city: jobData.city || '',
        postalCode: jobData.postalCode || '',
        companyName: jobData.companyName || '',
        competitorName: jobData.competitorName || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Jobs')
    } finally {
      setLoading(false)
    }
  }

  const saveNote = async () => {
    if (!secret || !jobId) return

    setSavingNote(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/note?secret=${encodeURIComponent(secret)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: adminNote }),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Notiz')
      }

      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Notiz')
    } finally {
      setSavingNote(false)
    }
  }

  const saveMetadata = async () => {
    if (!secret || !jobId) return

    setSavingMetadata(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/metadata?secret=${encodeURIComponent(secret)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadataForm),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Metadaten')
      }

      const data = await response.json()
      const updatedJob = data.success && data.data ? data.data.job : data.job
      
      if (updatedJob && job) {
        // Update local job state
        setJob({
          ...job,
          industry: updatedJob.industry,
          city: updatedJob.city,
          postalCode: updatedJob.postalCode,
          companyName: updatedJob.companyName,
          competitorName: updatedJob.competitorName,
        })
      }

      setMetadataSaved(true)
      setEditingMetadata(false)
      setTimeout(() => setMetadataSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Metadaten')
    } finally {
      setSavingMetadata(false)
    }
  }

  const handleRescan = async () => {
    if (!secret || !job) return

    try {
      const response = await fetch('/api/scan/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: job.url }),
      })

      const data = await response.json()
      if (response.ok && data.data?.jobId) {
        router.push(`/admin/jobs/${data.data.jobId}?secret=${encodeURIComponent(secret)}`)
      } else {
        throw new Error('Fehler beim Starten des Rescans')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Starten des Rescans')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: 'Gut', color: 'text-green-600' }
    if (score >= 50) return { label: 'Mittel', color: 'text-yellow-600' }
    return { label: 'Kritisch', color: 'text-red-600' }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Zugriff verweigert
  if (accessDenied) {
    return (
      <>
        <AdminHeader title="Zugriff verweigert" />
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-red-900 mb-4">Zugriff verweigert</h2>
            <p className="text-slate-600">Sie haben keinen Zugriff auf diese Seite.</p>
          </div>
        </div>
      </>
    )
  }

  // Loading
  if (loading) {
    return (
      <>
        <AdminHeader title="Scan-Details" subtitle="Lade Daten..." />
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            <p className="mt-4 text-slate-600">Lade Scan-Details...</p>
          </div>
        </div>
      </>
    )
  }

  // Error
  if (error && !job) {
    return (
      <>
        <AdminHeader title="Fehler" />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-red-900 mb-2">Fehler</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </>
    )
  }

  if (!job) {
    return (
      <>
        <AdminHeader title="Scan nicht gefunden" />
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-slate-600">Job nicht gefunden</p>
          </div>
        </div>
      </>
    )
  }

  const issues = job.result?.issues || []
  const top5Issues = [...issues]
    .sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
             (severityOrder[a.severity as keyof typeof severityOrder] || 0)
    })
    .slice(0, 5)

  const scoreBreakdown = job.result?.scoreBreakdown

  return (
    <>
      <AdminHeader
        title="Scan-Details"
        subtitle={job.label || job.url}
        actions={
          <Link
            href={`/admin?secret=${encodeURIComponent(secret || '')}`}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Zurück zur Übersicht
          </Link>
        }
      />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 break-all">
                      {job.url}
                    </h1>
                    {job.label && (
                      <p className="text-sm text-slate-600 mb-3">{job.label}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusLabel(job.status)}
                        </span>
                      </span>
                      <span>Scan: {formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {job.result && (
                      <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full ${getScoreColor(job.result.score)} flex items-center justify-center text-white font-bold shadow-lg`}>
                          <span className="text-3xl">{job.result.score}</span>
                        </div>
                        <p className={`mt-2 text-sm font-semibold ${getScoreStatus(job.result.score).color}`}>
                          {getScoreStatus(job.result.score).label}
                        </p>
                      </div>
                    )}
                    {job.result && (
                      <a
                        href={`/?jobId=${jobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Öffentliche Ergebnis-Seite öffnen
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata Edit Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Metadaten & Benchmark-Daten</h2>
                  {!editingMetadata && (
                    <button
                      onClick={() => setEditingMetadata(true)}
                      className="px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors flex items-center gap-2"
                    >
                      <Info className="w-4 h-4" />
                      Bearbeiten
                    </button>
                  )}
                </div>
                
                {!editingMetadata ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Branche:</span>
                      <p className="font-medium text-slate-900">{job.industry || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Stadt:</span>
                      <p className="font-medium text-slate-900">{job.city || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Postleitzahl:</span>
                      <p className="font-medium text-slate-900">{job.postalCode || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Firmenname:</span>
                      <p className="font-medium text-slate-900">{job.companyName || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Konkurrent-Hinweis:</span>
                      <p className="font-medium text-slate-900">{job.competitorName || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-2">
                          Branche
                        </label>
                        <input
                          id="industry"
                          type="text"
                          value={metadataForm.industry}
                          onChange={(e) => setMetadataForm({ ...metadataForm, industry: e.target.value })}
                          placeholder="z.B. Zahnarzt, Anwalt, Steuerberater, Handwerk"
                          list="industry-suggestions"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                        <datalist id="industry-suggestions">
                          <option value="Zahnarzt" />
                          <option value="Anwalt" />
                          <option value="Steuerberater" />
                          <option value="Arzt" />
                          <option value="Physiotherapeut" />
                          <option value="Handwerk" />
                          <option value="Gastronomie" />
                          <option value="Einzelhandel" />
                          <option value="Architekt" />
                          <option value="Ingenieur" />
                        </datalist>
                      </div>
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">
                          Stadt
                        </label>
                        <input
                          id="city"
                          type="text"
                          value={metadataForm.city}
                          onChange={(e) => setMetadataForm({ ...metadataForm, city: e.target.value })}
                          placeholder="z.B. Köln"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700 mb-2">
                          Postleitzahl
                        </label>
                        <input
                          id="postalCode"
                          type="text"
                          value={metadataForm.postalCode}
                          onChange={(e) => setMetadataForm({ ...metadataForm, postalCode: e.target.value })}
                          placeholder="z.B. 50667"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                          Firmenname
                        </label>
                        <input
                          id="companyName"
                          type="text"
                          value={metadataForm.companyName}
                          onChange={(e) => setMetadataForm({ ...metadataForm, companyName: e.target.value })}
                          placeholder="z.B. Zahnarztpraxis Müller"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="competitorName" className="block text-sm font-medium text-slate-700 mb-2">
                          Konkurrent-Hinweis (optional)
                        </label>
                        <input
                          id="competitorName"
                          type="text"
                          value={metadataForm.competitorName}
                          onChange={(e) => setMetadataForm({ ...metadataForm, competitorName: e.target.value })}
                          placeholder="z.B. Beispiel-Konzern GmbH"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Nur manuell gesetzt. Wird im Benchmark-Vergleich angezeigt, wenn Score-Unterschied &gt;15 Punkte.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={saveMetadata}
                        disabled={savingMetadata}
                        className="px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed"
                      >
                        {savingMetadata ? 'Wird gespeichert...' : 'Speichern'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingMetadata(false)
                          // Reset form to original values
                          if (job) {
                            setMetadataForm({
                              industry: job.industry || '',
                              city: job.city || '',
                              postalCode: job.postalCode || '',
                              companyName: job.companyName || '',
                              competitorName: job.competitorName || '',
                            })
                          }
                        }}
                        className="px-4 py-2 text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Abbrechen
                      </button>
                      {metadataSaved && (
                        <span className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Gespeichert
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Low Hanging Fruit Debug Info (Admin only) */}
              {job.lowHangingFruit && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Low Hanging Fruit (Debug)
                  </h3>
                  <p className="text-xs text-blue-700 mb-1">
                    <strong>Rule:</strong> {job.lowHangingFruit.rule}
                  </p>
                  <p className="text-xs text-blue-700">
                    <strong>Issue ID:</strong> {job.lowHangingFruit.issue?.id || 'N/A'}
                  </p>
                </div>
              )}

              {/* Executive Summary Card */}
              {job.result && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Executive Summary</h2>
                  
                  {/* Top 5 Probleme */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Top 5 Probleme</h3>
                    <div className="space-y-2">
                      {top5Issues.length > 0 ? (
                        top5Issues.map((issue: any, index: number) => (
                          <div
                            key={issue.id || index}
                            className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                            onClick={() => setActiveTab('issues')}
                          >
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              issue.severity === 'high' ? 'bg-red-100 text-red-700' :
                              issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {issue.severity === 'high' ? 'Kritisch' : issue.severity === 'medium' ? 'Mittel' : 'Gering'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">{issue.title}</p>
                              {issue.evidence && (
                                <p className="text-xs text-slate-600 mt-1">{issue.evidence}</p>
                              )}
                            </div>
                            <span className="text-xs text-sky-600 font-medium">→</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">Keine Probleme gefunden</p>
                      )}
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  {scoreBreakdown && (
                    <div className="pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Score Breakdown</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Technical</p>
                          <p className="text-lg font-bold text-slate-900">{scoreBreakdown.technical ?? 'N/A'}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">SEO</p>
                          <p className="text-lg font-bold text-slate-900">{scoreBreakdown.seo ?? 'N/A'}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Legal</p>
                          <p className="text-lg font-bold text-slate-900">{scoreBreakdown.legal ?? 'N/A'}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">UX/Design</p>
                          <p className="text-lg font-bold text-slate-900">{scoreBreakdown.uxDesign ?? 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Benchmark Comparison - Admin view shows even with low sample size */}
              {job.result && job.industry && job.city && (
                <BenchmarkComparison
                  industry={job.industry}
                  city={job.city}
                  yourScore={job.result.score}
                  isAdmin={true}
                  competitorName={job.competitorName || null}
                />
              )}

              {/* Tabs */}
              {job.result && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                  {/* Tab Navigation */}
                  <div className="border-b border-slate-200">
                    <div className="flex overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('issues')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'issues'
                            ? 'border-sky-500 text-sky-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Issues ({issues.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('pages')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'pages'
                            ? 'border-sky-500 text-sky-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Pages
                      </button>
                      <button
                        onClick={() => setActiveTab('assets')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'assets'
                            ? 'border-sky-500 text-sky-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Assets/Links
                      </button>
                      <button
                        onClick={() => setActiveTab('notes')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'notes'
                            ? 'border-sky-500 text-sky-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Notes
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === 'issues' && (
                      <div className="space-y-4">
                        {issues.length === 0 ? (
                          <div className="text-center py-12">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-slate-900 mb-2">Keine Probleme festgestellt</p>
                            <p className="text-slate-600">Für diese Website wurden keine Probleme gefunden.</p>
                          </div>
                        ) : (
                          issues.map((issue: any, index: number) => (
                            <div
                              key={issue.id || index}
                              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-3 mb-2">
                                <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                                  issue.severity === 'high' ? 'bg-red-100 text-red-700' :
                                  issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {issue.severity === 'high' ? 'Kritisch' : issue.severity === 'medium' ? 'Mittel' : 'Gering'}
                                </span>
                                <h4 className="font-semibold text-slate-900 flex-1">{issue.title}</h4>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                              {issue.evidence && (
                                <p className="text-xs text-slate-500 mb-2">Evidence: {issue.evidence}</p>
                              )}
                              {issue.recommendation && (
                                <p className="text-xs text-sky-600 bg-sky-50 p-2 rounded mt-2">
                                  <strong>Empfehlung:</strong> {issue.recommendation}
                                </p>
                              )}
                              {issue.pages && issue.pages.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <p className="text-xs text-slate-500 mb-1">Betroffene Seiten:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {issue.pages.slice(0, 3).map((page: string, i: number) => (
                                      <a
                                        key={i}
                                        href={page}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-sky-600 hover:text-sky-700 underline truncate max-w-xs"
                                      >
                                        {page}
                                      </a>
                                    ))}
                                    {issue.pages.length > 3 && (
                                      <span className="text-xs text-slate-500">+{issue.pages.length - 3} weitere</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'pages' && (
                      <div className="text-center py-12">
                        <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">Page-Details werden in einer zukünftigen Version verfügbar sein.</p>
                      </div>
                    )}

                    {activeTab === 'assets' && (
                      <div className="text-center py-12">
                        <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">Assets/Links-Details werden in einer zukünftigen Version verfügbar sein.</p>
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="adminNote" className="block text-sm font-medium text-slate-700 mb-2">
                            Admin-Notiz
                          </label>
                          <textarea
                            id="adminNote"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={8}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            placeholder="Interne Notizen zu diesem Scan..."
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={saveNote}
                            disabled={savingNote}
                            className="px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed"
                          >
                            {savingNote ? 'Wird gespeichert...' : 'Notiz speichern'}
                          </button>
                          {noteSaved && (
                            <span className="text-sm text-green-600 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Gespeichert
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Result State */}
              {!job.result && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                  <p className="text-lg font-semibold text-slate-900 mb-2">Noch kein Ergebnis verfügbar</p>
                  <p className="text-sm text-slate-600 mb-4">
                    Status: <span className="font-bold text-slate-700">{getStatusLabel(job.status)}</span>
                  </p>
                  {job.error && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-md mx-auto">
                      <p className="text-red-800 font-bold mb-2">Fehler:</p>
                      <p className="text-red-700 text-sm">{job.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Actions Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Aktionen</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleRescan}
                      className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Rescan
                    </button>
                    <a
                      href={`/api/report/pdf?id=${encodeURIComponent(jobId)}&secret=${encodeURIComponent(secret || '')}`}
                      target="_blank"
                      className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Export PDF
                    </a>
                    <button
                      onClick={() => {
                        // CSV Export - TODO: Implement
                        alert('CSV Export wird in Kürze verfügbar sein.')
                      }}
                      className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Export CSV
                    </button>
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-3">Lead-Verwaltung</p>
                      <button
                        onClick={() => {
                          // Mark as Lead - TODO: Implement
                          alert('Lead-Funktion wird in Kürze verfügbar sein.')
                        }}
                        className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Als Lead markieren
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Screenshot */}
                {job.result?.mobileScreenshotUrl && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Mobile Vorschau</h3>
                    <div className="rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={job.result.mobileScreenshotUrl}
                        alt="Mobile Screenshot"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
