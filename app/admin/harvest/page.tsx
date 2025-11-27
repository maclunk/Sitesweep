'use client'

import { useState } from 'react'
import { Search, Loader2, ImageIcon, FileText, CheckCircle, AlertCircle, Mail, Phone, Globe, Copy, Check } from 'lucide-react'

interface PageData {
  url: string
  title?: string
  content?: string
  images?: Array<{
    src: string
    alt?: string
  }>
}

interface HarvestResult {
  global?: {
    emails?: string[]
    phones?: string[]
    socials?: string[]
  }
  pages?: PageData[]
  [key: string]: any
}

export default function HarvestPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HarvestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedPageIndex, setSelectedPageIndex] = useState(0)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedStates({ ...copiedStates, [key]: true })
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [key]: false })
    }, 2000)
  }

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
    setSelectedPageIndex(0)

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

  const selectedPage = result?.pages?.[selectedPageIndex]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Content-Import</h1>
        <p className="text-slate-400 mt-2">Extrahieren Sie strukturierte Inhalte und Medien von beliebigen URLs.</p>
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
              placeholder="https://example.com"
              disabled={loading}
              className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 sm:text-sm transition-colors disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Crawling...
              </>
            ) : (
              'Inhalte extrahieren'
            )}
          </button>
        </form>
        {loading && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3 text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <div>
              <p className="font-medium">Website wird durchsucht...</p>
              <p className="text-sm text-slate-400 mt-1">Dies kann 30-40 Sekunden dauern für die vollständige Extraktion</p>
            </div>
          </div>
        )}
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
            <div className="flex-1">
              <p className="text-green-400 font-medium">Crawling erfolgreich abgeschlossen</p>
              <p className="text-sm text-slate-400 mt-1">
                {result.pages?.length || 0} Seiten gefunden
              </p>
            </div>
          </div>

          {/* Global Contact Data */}
          {result.global && (result.global.emails?.length || result.global.phones?.length || result.global.socials?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Emails */}
              {result.global.emails && result.global.emails.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-white">Emails ({result.global.emails.length})</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.global.emails.map((email, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2 group">
                        <a
                          href={`mailto:${email}`}
                          className="text-sm text-blue-400 hover:text-blue-300 truncate"
                        >
                          {email}
                        </a>
                        <button
                          onClick={() => handleCopy(email, `email-${idx}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-800 rounded"
                          title="Copy"
                        >
                          {copiedStates[`email-${idx}`] ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Phones */}
              {result.global.phones && result.global.phones.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-white">Phones ({result.global.phones.length})</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.global.phones.map((phone, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2 group">
                        <a
                          href={`tel:${phone}`}
                          className="text-sm text-green-400 hover:text-green-300 truncate"
                        >
                          {phone}
                        </a>
                        <button
                          onClick={() => handleCopy(phone, `phone-${idx}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-800 rounded"
                          title="Copy"
                        >
                          {copiedStates[`phone-${idx}`] ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Socials */}
              {result.global.socials && result.global.socials.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-white">Social Links ({result.global.socials.length})</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.global.socials.map((social, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2 group">
                        <a
                          href={social}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-400 hover:text-purple-300 truncate"
                        >
                          {social.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                        <button
                          onClick={() => handleCopy(social, `social-${idx}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-800 rounded"
                          title="Copy"
                        >
                          {copiedStates[`social-${idx}`] ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* Pages Navigation */}
          {result.pages && result.pages.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-semibold text-white">Gefundene Seiten ({result.pages.length})</h3>
              </div>
              <div className="p-2">
                <div className="flex flex-wrap gap-2">
                  {result.pages.map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPageIndex(idx)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPageIndex === idx
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {page.title || new URL(page.url).pathname || 'Seite ' + (idx + 1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Page Content */}
          {selectedPage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Text Content */}
              <div className="space-y-4">
                {/* Page Info */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-slate-300">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Seiten-Info</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div>
                      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Titel</dt>
                      <dd className="mt-1 text-sm text-slate-300">{selectedPage.title || 'Kein Titel'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">URL</dt>
                      <dd className="mt-1 text-sm text-blue-400 truncate">
                        <a href={selectedPage.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">
                          {selectedPage.url}
                        </a>
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                {selectedPage.content && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Extrahierter Text</span>
                        <span className="text-xs text-slate-500">
                          ({selectedPage.content?.split(' ').length || 0} Wörter)
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedPage.content || '', 'content')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                      >
                        {copiedStates['content'] ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Kopiert!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Text kopieren
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="bg-slate-950 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {selectedPage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Images */}
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-slate-300">
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">
                        Gefundene Bilder {selectedPage.images && `(${selectedPage.images.length})`}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    {selectedPage.images && selectedPage.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedPage.images.map((imgItem: any, index: number) => {
                          // RESOLVE URL: Handle both string arrays and object arrays
                          let finalUrl = "";
                          let altText = "";
                          
                          if (typeof imgItem === 'string') {
                            finalUrl = imgItem;
                          } else if (typeof imgItem === 'object' && imgItem !== null) {
                            // Try common keys if it's an object
                            finalUrl = imgItem.src || imgItem.url || imgItem.link || "";
                            altText = imgItem.alt || "";
                          }

                          // Fallback if URL is weird/empty
                          if (!finalUrl || finalUrl === "undefined") return null;

                          return (
                            <div key={index} className="relative group border border-slate-700 rounded overflow-hidden bg-slate-900">
                              <img
                                src={finalUrl}
                                referrerPolicy="no-referrer"
                                alt={altText || `Harvested ${index}`}
                                className="w-full h-48 object-contain bg-black/50"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.fallback-box');
                                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                }}
                              />
                              
                              {/* Fallback Box */}
                              <div className="fallback-box hidden w-full h-48 items-center justify-center text-slate-500 bg-slate-800 text-xs text-center p-2">
                                Bild nicht ladbar
                              </div>

                              {/* Debug Link & Copy */}
                              <div className="p-2 bg-slate-950 border-t border-slate-800 flex justify-between items-center gap-2">
                                <a 
                                  href={finalUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[10px] text-blue-400 hover:underline truncate flex-1 min-w-0"
                                  title={finalUrl}
                                >
                                  {finalUrl}
                                </a>
                                <button
                                  onClick={() => navigator.clipboard.writeText(finalUrl)}
                                  className="text-xs text-slate-400 hover:text-white flex-shrink-0"
                                  title="URL kopieren"
                                >
                                  📋
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm p-4">Keine Bilder auf dieser Unterseite gefunden.</p>
                    )}
                  </div>
                </div>
            </div>
          </div>
          )}

          {/* Debug Panel - Raw Data */}
          {selectedPage && (
            <div className="mt-6 p-4 bg-black border border-slate-800 rounded">
              <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase">Debug: Raw Data from Backend (Selected Page)</h3>
              <pre className="text-[10px] text-green-400 overflow-auto max-h-64 font-mono leading-relaxed">
                {JSON.stringify(selectedPage, null, 2)}
              </pre>
            </div>
          )}

          {/* Raw JSON View - Full Result */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="font-mono text-sm">full_harvest_result.json</span>
              </div>
              <button
                onClick={() => handleCopy(JSON.stringify(result, null, 2), 'json')}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
              >
                {copiedStates['json'] ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    JSON kopieren
                  </>
                )}
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
