'use client'

import { useState, useEffect } from 'react'

interface BenchmarkComparisonProps {
  industry: string | null | undefined
  city: string | null | undefined
  yourScore: number
  isAdmin?: boolean // If true, show even with low sample size
  competitorName?: string | null // Optional: Name of competitor to mention if score gap > 15
}

interface BenchmarkData {
  avgScore: number
  sampleSize: number
}

export function BenchmarkComparison({
  industry,
  city,
  yourScore,
  isAdmin = false,
  competitorName,
}: BenchmarkComparisonProps) {
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!industry || !city) {
      setLoading(false)
      return
    }

    const url = `/api/benchmark?industry=${encodeURIComponent(industry)}&city=${encodeURIComponent(city)}${isAdmin ? '&isAdmin=true' : ''}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBenchmark(data.data)
        } else {
          setBenchmark(null)
        }
      })
      .catch((error) => {
        console.error('Error fetching benchmark:', error)
        setBenchmark(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [industry, city, isAdmin])

  // Don't show anything if no industry/city
  if (!industry || !city) {
    return null
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/50 p-6 md:p-8 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  // No benchmark data available
  if (!benchmark) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/50 p-6 md:p-8 mb-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-3">
          Vergleich mit ähnlichen Betrieben
        </h3>
        <p className="text-slate-600 leading-relaxed">
          Für Ihre Branche in <strong>{city}</strong> liegen noch nicht genügend Vergleichsdaten vor.
        </p>
        <p className="text-slate-600 leading-relaxed mt-2">
          Sobald wir mehr Websites analysiert haben, zeigen wir Ihnen hier den Markt-Benchmark.
        </p>
      </div>
    )
  }

  // For admin: show warning if sample size is low
  const hasLowSampleSize = benchmark.sampleSize < 10
  const scoreDiff = yourScore - benchmark.avgScore
  const isBelowAverage = scoreDiff < 0
  const isSignificantlyBelow = scoreDiff < -15

  // Determine severity color
  let severityColor = 'text-slate-700'
  if (isSignificantlyBelow) {
    severityColor = 'text-red-600'
  } else if (isBelowAverage) {
    severityColor = 'text-yellow-600'
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-200/50 p-6 md:p-8 mb-6">
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        Vergleich mit ähnlichen Betrieben
      </h3>

      {isAdmin && hasLowSampleSize && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Hinweis:</strong> Niedrige Datenbasis ({benchmark.sampleSize} Scans). Diese
            Daten werden nur im Admin-Bereich angezeigt.
          </p>
        </div>
      )}

      <p className="text-slate-600 leading-relaxed mb-4">
        Der Durchschnitt der <strong>{industry}</strong>-Betriebe in <strong>{city}</strong> liegt
        bei <strong>{Math.round(benchmark.avgScore)}/100</strong>. Ihre Website liegt bei{' '}
        <strong className={severityColor}>{yourScore}/100</strong>.
      </p>

      {isBelowAverage && (
        <p className="text-slate-700 leading-relaxed mb-4">
          Dadurch verlieren Sie Sichtbarkeit und Aufträge an modernere Wettbewerber.
        </p>
      )}

      {/* Competitor hint - only if competitorName exists, benchmark exists, and score gap > 15 */}
      {competitorName && isSignificantlyBelow && (
        <p className="text-slate-700 leading-relaxed mb-4 font-medium">
          In Ihrer Region wirken Wettbewerber wie <strong>{competitorName}</strong> aktuell moderner und bekommen dadurch leichter Anfragen.
        </p>
      )}

      {/* Visual comparison bar */}
      <div className="mt-6 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-600">Marktdurchschnitt</span>
            <span className="text-sm font-semibold text-slate-700">
              {Math.round(benchmark.avgScore)}/100
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-sky-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, benchmark.avgScore))}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-600">Ihre Website</span>
            <span className={`text-sm font-semibold ${severityColor}`}>{yourScore}/100</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                isSignificantlyBelow
                  ? 'bg-red-500'
                  : isBelowAverage
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, yourScore))}%` }}
            ></div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-4">
        Basierend auf {benchmark.sampleSize} analysierten Websites.
      </p>
    </div>
  )
}

