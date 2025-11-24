'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function BulkScanPage() {
  const [secret, setSecret] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{
    batchId: string
    totalRows: number
    validUrls: number
    invalidUrls: number
    createdJobs: number
    skippedDuplicates: number
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('Bitte wählen Sie eine Excel-Datei (.xlsx oder .xls)')
        setFile(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !secret) {
      setError('Bitte wählen Sie eine Datei aus')
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/admin/bulk-scan?secret=${encodeURIComponent(secret)}`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setAccessDenied(true)
          return
        }
        throw new Error(data.error || 'Fehler beim Hochladen der Datei')
      }

      if (data.success && data.data) {
        setResult(data.data)
        // Redirect to results page after 2 seconds
        setTimeout(() => {
          router.push(`/admin/bulk-scan/${data.data.batchId}?secret=${encodeURIComponent(secret || '')}`)
        }, 2000)
      } else {
        throw new Error('Ungültige Antwort vom Server')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Hochladen der Datei'
      setError(errorMessage)
      console.error('Error uploading file:', err)
    } finally {
      setUploading(false)
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
      <main className="max-w-4xl mx-auto px-4 py-10">
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
            Massenscan (Excel-Upload)
          </h1>
          <p className="text-slate-600 mb-8">
            Laden Sie eine Excel-Datei mit Website-URLs hoch. Wir erstellen automatisch Scan-Jobs und zeigen Ihnen anschließend die schlechtesten Websites zuerst an.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-2">
                Excel-Datei auswählen
              </label>
              <input
                type="file"
                id="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-slate-500">
                Erwartetes Format: Eine Spalte mit URLs (Spaltenname "url", "website" oder "link" oder erste Spalte)
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <strong>Fehler:</strong> {error}
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold mb-2">Upload erfolgreich!</p>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• {result.validUrls} gültige URLs gefunden</p>
                  <p>• {result.invalidUrls} ungültige URLs übersprungen</p>
                  <p>• {result.createdJobs} Scan-Jobs erstellt</p>
                  {result.skippedDuplicates > 0 && (
                    <p>• {result.skippedDuplicates} Duplikate übersprungen</p>
                  )}
                  <p className="mt-2 font-semibold">Batch-ID: {result.batchId}</p>
                  <p className="text-xs mt-2">Weiterleitung zu den Ergebnissen...</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Wird hochgeladen...' : 'Upload & Scans starten'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

