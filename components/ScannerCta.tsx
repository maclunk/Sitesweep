'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ScannerCtaProps {
  className?: string
}

export default function ScannerCta({ className = '' }: ScannerCtaProps) {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleScanStart = async () => {
    if (!url.trim()) return

    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    // Navigate to homepage with URL and trigger scan
    router.push(`/?url=${encodeURIComponent(normalizedUrl)}#scan-section`)
  }

  return (
    <div className={`bg-sky-50 rounded-xl shadow-sm border border-sky-200 p-6 md:p-8 text-center ${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">
        Lassen Sie Ihre Website jetzt überprüfen
      </h2>
      <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
        Finden Sie heraus, wo Ihre Website verbessert werden kann und wie Sie mehr Kunden erreichen.
      </p>
      
      <div className="max-w-2xl mx-auto mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="z.B. mein-unternehmen.de oder https://mein-unternehmen.de"
            disabled={loading}
            autoComplete="url"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                e.preventDefault()
                handleScanStart()
              }
            }}
          />
          <button
            type="button"
            onClick={handleScanStart}
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? 'Wird gestartet...' : 'Website prüfen'}
          </button>
        </div>
      </div>
      
      <p className="text-sm text-slate-500 mt-4">
        Die Analyse ist kostenlos und unverbindlich.
      </p>
    </div>
  )
}

