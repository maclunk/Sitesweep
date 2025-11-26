'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface ScanResult {
  status: string
  score?: number
  summary?: string
  issues?: any[]
  screenshot?: string | null
  mobileScreenshotUrl?: string | null
  techStack?: string[]
  industry?: string | null
  city?: string | null
  competitorName?: string | null
  url?: string | null
  lowHangingFruit?: any | null
  [key: string]: any // Allow any additional properties
}

export default function AdminScanPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('Bitte geben Sie eine URL ein')
      return
    }

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/scan/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Fehler beim Starten des Scans`)
      }

      const data = await response.json()
      const resultData = data.success && data.data ? data.data : data
      
      if (resultData.status === 'done' || resultData.score !== undefined) {
        setResult(resultData)
      } else if (resultData.error) {
        throw new Error(resultData.error)
      } else {
        throw new Error('Ungültige Antwort vom Scanner-Service')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Starten des Scans'
      setError(errorMessage)
      console.error('[Admin Scan] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score < 50) return 'text-red-600 bg-red-50 border-red-200'
    if (score < 80) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getScoreIcon = (score: number) => {
    if (score < 50) return <XCircle className="w-6 h-6" />
    if (score < 80) return <AlertTriangle className="w-6 h-6" />
    return <CheckCircle className="w-6 h-6" />
  }

  return (
    <>
      <AdminHeader
        title="Deep Scan"
        subtitle="Manuelle Website-Analyse für Debugging und Tests"
      />
      
      <div className="p-6 max-w-7xl">
        {/* Scan Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Neue Analyse starten</h2>
          <form onSubmit={handleScan} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Start Deep Scan
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <strong>Fehler:</strong> {error}
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className={`border-2 rounded-2xl p-6 ${getScoreColor(result.score || 0)}`}>
              <div className="flex items-center gap-4">
                {getScoreIcon(result.score || 0)}
                <div>
                  <div className="text-4xl font-bold">
                    {result.score || 0}<span className="text-2xl">/100</span>
                  </div>
                  <p className="text-sm font-medium mt-1">
                    {result.summary || 'Scan abgeschlossen'}
                  </p>
                </div>
              </div>
            </div>

            {/* Screenshot */}
            {(result.screenshot || result.mobileScreenshotUrl) && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Screenshot</h3>
                <div className="relative bg-slate-100 rounded-lg overflow-hidden">
                  <img
                    src={result.screenshot || result.mobileScreenshotUrl || ''}
                    alt="Website Screenshot"
                    className="w-full h-auto max-h-[600px] object-contain"
                  />
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {result.techStack && result.techStack.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Erkannte Technologien</h3>
                <div className="flex flex-wrap gap-2">
                  {result.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Issues Count */}
            {result.issues && result.issues.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Gefundene Issues ({result.issues.length})
                </h3>
                <div className="space-y-2">
                  {result.issues.slice(0, 5).map((issue: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start gap-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            issue.severity === 'high'
                              ? 'bg-red-100 text-red-700'
                              : issue.severity === 'medium'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{issue.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{issue.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {result.issues.length > 5 && (
                    <p className="text-sm text-slate-500 text-center pt-2">
                      ... und {result.issues.length - 5} weitere Issues
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Full JSON Response */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 bg-slate-800">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <code className="text-sm">JSON Response</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(result, null, 2))
                      alert('JSON in Zwischenablage kopiert!')
                    }}
                    className="ml-auto px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                  >
                    Copy
                  </button>
                </h3>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono leading-relaxed">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

