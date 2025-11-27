'use client'

import { useState } from 'react'
import { Search, Loader2, AlertCircle, CheckCircle, Terminal } from 'lucide-react'

export default function DeepScanPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) return

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`)
      }

      const data = await response.json()
      // Handle both wrapper formats (data.data or direct)
      setResult(data.data || data)

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Manueller Scan</h1>
        <p className="text-slate-400 mt-2">Führen Sie eine vollständige Website-Analyse für beliebige URLs durch.</p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <form onSubmit={handleScan} className="flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ziel-domain.de"
              className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 sm:text-sm transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Scan starten'}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Score Card */}
             <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
               <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Gesamt-Score</h3>
              <div className="relative inline-flex items-center justify-center">
                 <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      className="text-slate-800"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className={result.score >= 90 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'}
                      strokeWidth="10"
                      strokeDasharray={365}
                      strokeDashoffset={365 - (365 * (result.score || 0)) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <span className="absolute text-4xl font-bold text-white">{result.score || 0}</span>
              </div>
               <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                 {result.score >= 90 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                 {result.score >= 90 ? 'Ausgezeichnet' : result.score >= 50 ? 'Verbesserungsbedarf' : 'Kritisch'}
               </div>
            </div>

             {/* Screenshot Card */}
             <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
               <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Mobile-Vorschau</h3>
               <div className="aspect-video bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
                 {(result.mobileScreenshotUrl || result.screenshot) ? (
                   <img 
                     src={result.mobileScreenshotUrl || result.screenshot} 
                     alt="Scan Preview" 
                     className="h-full object-contain"
                   />
                 ) : (
                   <div className="text-slate-600 flex flex-col items-center gap-2">
                     <Loader2 className="w-6 h-6 animate-spin" />
                     <span>Screenshot wird verarbeitet...</span>
                   </div>
                 )}
               </div>
             </div>
          </div>

          {/* Raw JSON Viewer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2 text-slate-300">
                <Terminal className="w-4 h-4 text-blue-500" />
                <span className="font-mono text-sm">raw_scan_result.json</span>
              </div>
              <button 
                 onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                 className="text-xs text-blue-400 hover:text-blue-300 font-medium"
               >
                 JSON kopieren
               </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <pre className="p-4 text-xs md:text-sm font-mono text-green-400 bg-slate-950 leading-relaxed overflow-auto max-h-[600px]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
