'use client'

import { AlertTriangle, Shield, FileText, Search as SearchIcon, CheckCircle, XCircle, AlertCircle, Code, ArrowRight } from 'lucide-react'
import { getCalendlyLink } from '@/lib/calendly'

interface Issue {
  id: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  category?: 'security' | 'legal' | 'gdpr' | 'seo' | 'technical' | 'ux'
  pages?: string[]
}

interface AuditReportProps {
  score: number
  summary?: string
  screenshot?: string | null
  techStack?: string[]
  issues: Issue[]
  url: string
}

// Category German Labels with Icons
const categoryConfig = {
  security: {
    label: 'Sicherheit',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  legal: {
    label: 'Rechtliches',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  gdpr: {
    label: 'Datenschutz (DSGVO)',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  seo: {
    label: 'SEO & Auffindbarkeit',
    icon: SearchIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  technical: {
    label: 'Technischer Zustand',
    icon: Code,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
  ux: {
    label: 'Benutzerfreundlichkeit',
    icon: CheckCircle,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
}

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case 'high':
      return {
        label: 'Kritisch',
        icon: XCircle,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
      }
    case 'medium':
      return {
        label: 'Mittel',
        icon: AlertCircle,
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
      }
    default:
      return {
        label: 'Gering',
        icon: AlertTriangle,
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
      }
  }
}

const getScoreColor = (score: number) => {
  if (score < 50) return { color: '#dc2626', label: 'Kritisch', ring: 'ring-red-500' }
  if (score < 80) return { color: '#f59e0b', label: 'Verbesserungswürdig', ring: 'ring-orange-500' }
  return { color: '#10b981', label: 'Gut', ring: 'ring-green-500' }
}

export default function AuditReport({ score, summary, screenshot, techStack, issues, url }: AuditReportProps) {
  const scoreConfig = getScoreColor(score)

  // Group issues by category
  const groupedIssues = issues.reduce((acc, issue) => {
    const category = issue.category || 'technical'
    if (!acc[category]) acc[category] = []
    acc[category].push(issue)
    return acc
  }, {} as Record<string, Issue[]>)

  // Sort categories: high severity first
  const sortedCategories = Object.entries(groupedIssues).sort((a, b) => {
    const aHasHigh = a[1].some(i => i.severity === 'high')
    const bHasHigh = b[1].some(i => i.severity === 'high')
    if (aHasHigh && !bHasHigh) return -1
    if (!aHasHigh && bHasHigh) return 1
    return 0
  })

  return (
    <div className="space-y-8">
      {/* Hero Section: Score + Screenshot */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-soft border border-slate-200/50 p-6 md:p-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Score */}
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex flex-col items-center md:items-start">
              <div 
                className={`relative w-40 h-40 rounded-full flex items-center justify-center ring-8 ${scoreConfig.ring} ring-opacity-30 shadow-xl mb-4`}
                style={{ backgroundColor: scoreConfig.color }}
              >
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">{score}</div>
                  <div className="text-lg text-white/90">/100</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold" style={{ color: scoreConfig.color }}>
                  {scoreConfig.label}
                </div>
                {summary && (
                  <p className="text-slate-600 text-base leading-relaxed max-w-md">
                    {summary}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Screenshot in Browser Frame */}
          {screenshot && (
            <div className="relative">
              <div className="bg-slate-800 rounded-lg shadow-2xl overflow-hidden border-4 border-slate-700">
                {/* Browser Chrome */}
                <div className="bg-slate-700 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 bg-slate-600 rounded px-3 py-1 text-xs text-slate-300 truncate ml-2">
                    {url}
                  </div>
                </div>
                {/* Screenshot */}
                <div className="bg-white">
                  <img 
                    src={screenshot} 
                    alt="Website Screenshot" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Live-Analyse
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tech Stack Badges */}
      {techStack && techStack.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Erkanntes System</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-700 font-medium"
              >
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Issues by Category */}
      {sortedCategories.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">Gefundene Probleme</h2>
          
          {sortedCategories.map(([category, categoryIssues]) => {
            const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.technical
            const Icon = config.icon
            const hasHighSeverity = categoryIssues.some(i => i.severity === 'high')

            return (
              <div 
                key={category}
                className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${
                  hasHighSeverity ? 'border-red-300 ring-2 ring-red-100' : config.borderColor
                }`}
              >
                {/* Category Header */}
                <div className={`${config.bgColor} px-6 py-4 border-b ${config.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${config.color}`}>
                          {config.label}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {categoryIssues.length} {categoryIssues.length === 1 ? 'Problem' : 'Probleme'} gefunden
                        </p>
                      </div>
                    </div>
                    {hasHighSeverity && (
                      <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        Dringend
                      </div>
                    )}
                  </div>
                </div>

                {/* Issues List */}
                <div className="divide-y divide-slate-100">
                  {categoryIssues.map((issue, idx) => {
                    const severityConfig = getSeverityConfig(issue.severity)
                    const SeverityIcon = severityConfig.icon

                    return (
                      <div key={issue.id || idx} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${severityConfig.bgColor} border ${severityConfig.borderColor} flex items-center justify-center`}>
                            <SeverityIcon className={`w-4 h-4 ${severityConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h4 className="text-lg font-semibold text-slate-900">
                                {issue.title}
                              </h4>
                              <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${severityConfig.bgColor} ${severityConfig.color} border ${severityConfig.borderColor}`}>
                                {severityConfig.label}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-3">
                              {issue.description}
                            </p>
                            {issue.pages && issue.pages.length > 0 && (
                              <div className="text-sm text-slate-500">
                                <span className="font-medium">Betroffen:</span>{' '}
                                {issue.pages.slice(0, 3).join(', ')}
                                {issue.pages.length > 3 && ` und ${issue.pages.length - 3} weitere`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-sm p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            Keine kritischen Probleme gefunden
          </h3>
          <p className="text-green-700 max-w-2xl mx-auto">
            Ihre Website erfüllt die geprüften Standards. Regelmäßige Überprüfungen werden dennoch empfohlen.
          </p>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-cta rounded-2xl shadow-soft-lg border border-white/50 p-8 md:p-10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Diese Probleme lassen sich beheben.
          </h2>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
            Sprechen Sie mit Marcus und erfahren Sie, wie diese Fehler behoben werden können – schnell, transparent und zu fairen Festpreisen.
          </p>
          <a
            href={getCalendlyLink(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#0F766E] text-white font-semibold rounded-full text-lg hover:bg-[#0D5D56] transition-all shadow-soft-lg hover:shadow-soft min-h-[56px]"
          >
            Kostenlose Analyse buchen
            <ArrowRight className="w-6 h-6" />
          </a>
          <p className="text-sm text-slate-600 font-medium">
            Unverbindliches Gespräch • Konkrete Lösungen • Keine versteckten Kosten
          </p>
        </div>
      </div>
    </div>
  )
}

