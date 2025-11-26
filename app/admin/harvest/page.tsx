'use client'

import { useState } from 'react'
import { Search, Loader2, ImageIcon, FileText, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface HarvestResult {
  url: string
  title?: string
  description?: string
  content?: {
    text?: string
    headings?: string[]
    paragraphs?: string[]
    links?: Array<{ text: string; url: string }>
  }
  images?: Array<{
    src: string
    alt?: string
    width?: number
    height?: number
  }>
  metadata?: {
    author?: string
    publishDate?: string
    keywords?: string[]
    [key: string]: any
  }
  [key: string]: any
}

export default function HarvestPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HarvestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleHarvest = async (e: React.FormEvent) => {
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
      const response = await fetch('/api/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      if (!response.ok) {
        throw new Error(`Harvest failed: ${response.statusText}`)
      }

      const data = await response.json()
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
        <h1 className="text-3xl font-bold text-white tracking-tight">Content Harvester</h1>
        <p className="text-slate-400 mt-2">Extract structured content and media from any URL.</p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <form onSubmit={handleHarvest} className="flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 sm:text-sm transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Harvest Content'}
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
          {/* Success Banner */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-green-400 font-medium">Content harvested successfully</p>
              {result.title && (
                <p className="text-sm text-slate-400 mt-1">{result.title}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Extracted Data */}
            <div className="space-y-4">
              {/* Metadata Card */}
              {result.metadata && Object.keys(result.metadata).length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-slate-300">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Metadata</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    {Object.entries(result.metadata).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">{key}</dt>
                        <dd className="mt-1 text-sm text-slate-300">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              {result.content && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-slate-300">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Text Content</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Headings */}
                    {result.content.headings && result.content.headings.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                          Headings ({result.content.headings.length})
                        </h4>
                        <ul className="space-y-1">
                          {result.content.headings.slice(0, 5).map((heading, idx) => (
                            <li key={idx} className="text-sm text-slate-300 truncate">
                              • {heading}
                            </li>
                          ))}
                          {result.content.headings.length > 5 && (
                            <li className="text-xs text-slate-500">
                              ... and {result.content.headings.length - 5} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Paragraphs Preview */}
                    {result.content.paragraphs && result.content.paragraphs.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                          Paragraphs ({result.content.paragraphs.length})
                        </h4>
                        <div className="text-sm text-slate-400 space-y-2">
                          {result.content.paragraphs.slice(0, 3).map((para, idx) => (
                            <p key={idx} className="line-clamp-2">{para}</p>
                          ))}
                          {result.content.paragraphs.length > 3 && (
                            <p className="text-xs text-slate-500">
                              ... and {result.content.paragraphs.length - 3} more paragraphs
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {result.content.links && result.content.links.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                          Links Found ({result.content.links.length})
                        </h4>
                        <ul className="space-y-1">
                          {result.content.links.slice(0, 5).map((link, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <ExternalLink className="w-3 h-3 text-slate-600" />
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 truncate"
                              >
                                {link.text || link.url}
                              </a>
                            </li>
                          ))}
                          {result.content.links.length > 5 && (
                            <li className="text-xs text-slate-500">
                              ... and {result.content.links.length - 5} more links
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Raw JSON View */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="font-mono text-sm">raw_harvest.json</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(result, null, 2))
                      alert('JSON copied to clipboard!')
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Copy JSON
                  </button>
                </div>
                <div className="p-0 overflow-x-auto">
                  <pre className="p-4 text-xs md:text-sm font-mono text-green-400 bg-slate-950 leading-relaxed overflow-auto max-h-[400px]">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right Column: Images */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">
                      Extracted Images {result.images && `(${result.images.length})`}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  {result.images && result.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {result.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group hover:border-blue-500/50 transition-colors"
                        >
                          <div className="aspect-square relative">
                            <img
                              src={img.src}
                              alt={img.alt || `Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  const errorDiv = document.createElement('div')
                                  errorDiv.className = 'flex items-center justify-center h-full text-slate-600'
                                  errorDiv.innerHTML = '<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>'
                                  parent.appendChild(errorDiv)
                                }
                              }}
                            />
                          </div>
                          <div className="p-2 border-t border-slate-800">
                            <p className="text-xs text-slate-400 truncate" title={img.alt || img.src}>
                              {img.alt || 'No alt text'}
                            </p>
                            {(img.width || img.height) && (
                              <p className="text-xs text-slate-600 mt-1">
                                {img.width}×{img.height}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No images found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
