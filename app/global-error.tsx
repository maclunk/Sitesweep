'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console
    console.error('Global application error:', error)
  }, [error])

  return (
    <html lang="de">
      <body>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Kritischer Fehler
            </h1>
            <p className="text-slate-600 mb-6">
              Es ist ein kritischer Fehler aufgetreten. Bitte laden Sie die Seite neu.
            </p>
            {error.digest && (
              <p className="text-xs text-slate-400 mb-6 font-mono">
                Fehler-ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors mb-4"
            >
              Erneut versuchen
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
            >
              Zur Startseite
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

