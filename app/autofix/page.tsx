'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { hasAutoFix } from '@/lib/autofix/issues'

interface Issue {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  category: string
  pages: string[]
}

interface FixSuggestion {
  patch: string
  explanation: string
}

function AutoFixPage() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')
  const secret = searchParams.get('secret')
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [fixSuggestion, setFixSuggestion] = useState<FixSuggestion | null>(null)
  const [generating, setGenerating] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    // Prüfe Secret beim Laden der Seite
    if (!secret) {
      setHasAccess(false)
      return
    }

    // Prüfe Secret via API (serverseitige Validierung)
    checkSecret()
  }, [secret])

  const checkSecret = async () => {
    if (!secret) {
      setHasAccess(false)
      return
    }

    try {
      // Prüfe Secret via Admin-API (konsistent mit bestehender Logik)
      const response = await fetch(`/api/admin/jobs?secret=${encodeURIComponent(secret)}`)
      
      if (response.ok) {
        setHasAccess(true)
        if (jobId) {
          loadIssues()
        }
      } else {
        setHasAccess(false)
      }
    } catch (err) {
      setHasAccess(false)
    }
  }

  useEffect(() => {
    if (hasAccess && jobId) {
      loadIssues()
    }
  }, [hasAccess, jobId])

  const loadIssues = async () => {
    if (!jobId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/scan/status?id=${encodeURIComponent(jobId)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden der Issues')
      }

      const issuesData = data.success && data.data ? data.data.issues : data.issues
      if (Array.isArray(issuesData)) {
        setIssues(issuesData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Issues')
    } finally {
      setLoading(false)
    }
  }

  const generateFix = async (issue: Issue) => {
    if (!jobId || !secret) return

    setGenerating(true)
    setError(null)
    setSuccess(null)
    setFixSuggestion(null)
    setSelectedIssue(issue)

    try {
      const response = await fetch(`/api/fix/suggest?secret=${encodeURIComponent(secret)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          issueId: issue.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Generieren des Fix-Vorschlags')
      }

      const suggestion = data.success && data.data ? data.data : data
      setFixSuggestion({
        patch: suggestion.patch || '',
        explanation: suggestion.explanation || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Generieren des Fix-Vorschlags')
    } finally {
      setGenerating(false)
    }
  }

  const applyFix = async () => {
    if (!jobId || !selectedIssue || !fixSuggestion || !secret) return

    setApplying(true)
    setError(null)
    setSuccess(null)

    try {
      // Hole pageUrl (erste betroffene Seite)
      const pageUrl = selectedIssue.pages && selectedIssue.pages.length > 0 
        ? selectedIssue.pages[0] 
        : null

      if (!pageUrl) {
        throw new Error('Keine betroffene Seite gefunden')
      }

      const response = await fetch(`/api/fix/apply?secret=${encodeURIComponent(secret)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          pageUrl,
          patch: fixSuggestion.patch,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Anwenden des Fixes')
      }

      setSuccess('Fix erfolgreich angewendet!')
      setFixSuggestion(null)
      setSelectedIssue(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Anwenden des Fixes')
    } finally {
      setApplying(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Zeige Zugriff verweigert, wenn kein Secret oder Secret falsch
  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Zugriff verweigert</h1>
            <p className="text-gray-600">Dieser Bereich ist nur für Administratoren zugänglich.</p>
            <p className="text-gray-500 text-sm mt-2">(Adminbereich)</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Zeige Loading während Secret-Prüfung
  if (hasAccess === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Prüfe Zugriff...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AutoFix</h1>
          <p className="text-gray-600">Automatische Fehlerbehebung für Ihre Website</p>
        </div>

        {!jobId && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Fehler:</p>
            <p className="text-red-700">Keine Job-ID gefunden. Bitte von der Scan-Ergebnisseite aus aufrufen.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Fehler:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">Erfolg:</p>
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Lade Issues...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Verfügbare Issues</h2>
              
              {issues.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600">Keine Issues gefunden.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {issues.map((issue) => {
                    const isAutofixable = hasAutoFix(issue.id)
                    const isSelected = selectedIssue?.id === issue.id
                    const isGenerating = generating && isSelected

                    return (
                      <div
                        key={issue.id}
                        className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 flex-1">
                            {issue.title}
                          </h3>
                          <span
                            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {issue.description}
                        </p>

                        {isAutofixable ? (
                          <button
                            onClick={() => generateFix(issue)}
                            disabled={generating}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                              isGenerating
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isGenerating ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generiere Fix...
                              </span>
                            ) : (
                              'Fix-Vorschlag erzeugen'
                            )}
                          </button>
                        ) : (
                          <div className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-500 text-center text-sm">
                            AutoFix nicht verfügbar
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {fixSuggestion && selectedIssue && (
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Fix-Vorschlag für: {selectedIssue.title}
                </h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Erklärung</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
                    {fixSuggestion.explanation}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Patch</h3>
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                    {fixSuggestion.patch}
                  </pre>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={applyFix}
                    disabled={applying}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      applying
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {applying ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Wird angewendet...
                      </span>
                    ) : (
                      'Fix anwenden'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setFixSuggestion(null)
                      setSelectedIssue(null)
                    }}
                    className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function AutoFixPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Lade Seite...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <AutoFixPage />
    </Suspense>
  )
}
