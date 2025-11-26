'use client'

import { useState } from 'react'
import { Wheat, Loader2, FileText, Image as ImageIcon, Download } from 'lucide-react'

export default function ContentHarvestPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [harvested, setHarvested] = useState(false)

  const handleHarvest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    // Mock harvest delay
    setTimeout(() => {
      setLoading(false)
      setHarvested(true)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Content Harvester</h1>
        <p className="text-slate-400 mt-2">Extract raw text, images, and metadata from any website.</p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <form onSubmit={handleHarvest} className="flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Wheat className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://source-domain.com"
              className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 sm:text-sm transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Harvest Content'}
          </button>
        </form>
      </div>

      {/* Mock Output Area */}
      {harvested ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Text Content Mock */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Text Content
              </h3>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">24 Paragraphs</span>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-slate-800 rounded w-full animate-pulse" />
              <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-slate-800 rounded w-4/5 animate-pulse" />
            </div>
            <button className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download Text
            </button>
          </div>

          {/* Images Mock */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-slate-400" />
                Media Assets
              </h3>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">12 Images</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
            <button className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download All Media
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl">
          <Wheat className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Enter a URL above to start harvesting content.</p>
        </div>
      )}
    </div>
  )
}

