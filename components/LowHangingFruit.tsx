'use client'

import { getIssueExplanation } from '@/lib/issue-explanations'
import { getCalendlyLink } from '@/lib/calendly'

interface LowHangingFruitProps {
  issue: {
    id?: string
    title: string
    description: string
    severity: 'high' | 'medium' | 'low'
    pages: string[]
  }
  url: string
  rule?: string // For admin debugging
}

export function LowHangingFruit({ issue, url, rule }: LowHangingFruitProps) {
  const businessExplanation = issue.id ? getIssueExplanation(issue.id) : null
  
  // Generate specific message based on issue type
  let headline = 'Schnellster Verbesserungs-Hebel'
  let bodyText = ''
  
  if (issue.id === 'legal-missing-impressum' || issue.id === 'no-impressum') {
    headline = 'Schnellster Verbesserungs-Hebel'
    bodyText =
      'Auf Ihrer Website fehlt ein korrektes Impressum. Das ist rechtlich riskant und wirkt unseriös. Abmahnungen liegen häufig im Bereich von vierstelligen Beträgen. Wir können das schnell für Sie sauber einrichten.'
  } else if (
    issue.id === 'legal-missing-privacy' ||
    issue.id === 'no-datenschutz'
  ) {
    headline = 'Schnellster Verbesserungs-Hebel'
    bodyText =
      'Auf Ihrer Website fehlt eine Datenschutzerklärung. Das ist seit der DSGVO rechtlich Pflicht und kann zu Bußgeldern führen. Wir können das schnell für Sie sauber einrichten.'
  } else if (
    issue.id === 'legal-missing-cookie-banner' ||
    issue.id === 'no-cookie-banner'
  ) {
    headline = 'Schnellster Verbesserungs-Hebel'
    bodyText =
      'Ihre Website verwendet Cookies, hat aber kein Cookie-Banner. Das ist seit der DSGVO rechtlich Pflicht und kann zu Abmahnungen führen. Wir können das schnell für Sie sauber einrichten.'
  } else if (issue.id === 'copyright_year_outdated') {
    const currentYear = new Date().getFullYear()
    headline = 'Schnellster Verbesserungs-Hebel'
    bodyText =
      `Im Footer steht noch ein Copyright-Jahr von vor ${currentYear}. Für Besucher wirkt das wie "nicht gepflegt". Ein kleiner Fix, der sofort seriöser wirkt.`
  } else if (businessExplanation) {
    // Use business explanation as fallback
    headline = 'Schnellster Verbesserungs-Hebel'
    bodyText = businessExplanation.explanationBusiness
  } else {
    // Fallback to technical description
    headline = 'Schnellster Verbesserungs-Hebel'
    bodyText = issue.description
  }

  const calendlyLink = getCalendlyLink(url)

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl shadow-soft border-2 border-sky-200 p-6 md:p-8 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            ⚡
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">{headline}</h3>
          <p className="text-slate-700 leading-relaxed mb-6 max-w-prose">
            {bodyText}
          </p>
          
          <a
            href={calendlyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors shadow-lg"
          >
            Kostenlose Experten-Analyse buchen
          </a>
          
          {/* Admin debugging info (only visible if rule is provided and in dev mode) */}
          {rule && process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-slate-500 mt-4 italic">
              Debug: Rule = {rule}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

