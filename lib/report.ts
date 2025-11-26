import { CheckResult } from './checks'
import { SCANNER_ALWAYS_MAX_SCORE_DOMAINS } from './config'
import { selectLowHangingFruit, LowHangingFruitResult } from './low-hanging-fruit'

// Minimal CrawlResult type for compatibility (crawler.ts removed)
interface CrawlResult {
  pages?: Array<{ url: string }>
}

export interface Report {
  id: string
  url: string
  createdAt: Date
  score: number
  issues: CheckResult[]
}

export interface ReportResult {
  score: number
  scoreRaw?: number // Optional: Roh-Score vor Normalisierung
  summary: string
  issues: CheckResult[]
  scoreBreakdown?: ScoreBreakdown
  lowHangingFruit?: LowHangingFruitResult // Optional: Best issue to highlight as "quick win"
}

/**
 * Strukturierte Score-Aufschlüsselung nach Teilbereichen
 * 
 * Neue Kategorien und Gewichtung:
 * - technical: 35% (Technik, Performance, HTTPS, Response-Codes, Broken Links)
 * - seo: 20% (SEO, Title, Meta, Heading-Struktur)
 * - legal: 20% (Impressum, Datenschutz, rechtliche Compliance)
 * - uxDesign: 25% (Mobile, Responsive, UX, Design-Modernität)
 * 
 * Gesamtscore = gewichteter Durchschnitt der Teil-Scores
 */
export interface ScoreBreakdown {
  technical: number  // 0-100: Technik & Performance
  seo: number        // 0-100: SEO & Suchmaschinenoptimierung
  legal: number      // 0-100: Rechtliche Compliance
  uxDesign: number   // 0-100: UX & Design-Modernität
  rawOverall: number // 0-100: Roh-Gesamtscore (vor Penalty & Normalisierung)
}

/**
 * Berechnet den Gesamtscore basierend auf Issues
 * 
 * Veraltet: Diese Funktion wird durch calculateScoreWithBreakdown ersetzt.
 * Wird vorerst beibehalten für Rückwärtskompatibilität.
 */
export function combine(crawl: CrawlResult, checks: CheckResult[]): number {
  const breakdown = calculateScoreWithBreakdown(checks)
  const final = normalizeAndApplyWhitelist(breakdown, crawl?.pages?.[0]?.url || '')
  return final.finalScore
}

/**
 * Berechnet Raw Scores pro Kategorie (0-100) basierend auf Issues
 * 
 * Strategie:
 * - Jede Kategorie startet bei 100
 * - Abzüge basierend auf Severity der Issues:
 *   - High: -15 Punkte pro Issue
 *   - Medium: -8 Punkte pro Issue
 *   - Low: -3 Punkte pro Issue
 * - Clamp auf 0-100
 */
function calculateCategoryRawScores(issues: CheckResult[]): {
  technical: number
  seo: number
  legal: number
  uxDesign: number
} {
  // Start bei 100 für jede Kategorie
  let technicalScore = 100
  let seoScore = 100
  let legalScore = 100
  let uxDesignScore = 100

  if (!issues || !Array.isArray(issues) || issues.length === 0) {
    // Keine Issues = perfekte Raw Scores
    return {
      technical: 100,
      seo: 100,
      legal: 100,
      uxDesign: 100,
    }
  }

  // Gruppiere Issues nach Kategorie und wende Abzüge an
  issues.forEach((issue) => {
    if (!issue || !issue.severity || !issue.category) return

    // Bestimme Abzug basierend auf Severity
    let deduction = 0
    switch (issue.severity) {
      case 'high':
        deduction = 15
        break
      case 'medium':
        deduction = 8
        break
      case 'low':
        deduction = 3
        break
    }

    // Wende Abzug auf entsprechende Kategorie an
    switch (issue.category) {
      case 'technical':
        technicalScore -= deduction
        break
      case 'seo':
        seoScore -= deduction
        break
      case 'legal':
        legalScore -= deduction
        break
      case 'ux':
        // UX-Issues gehören zur uxDesign-Kategorie
        uxDesignScore -= deduction
        break
      default:
        // Unbekannte Kategorie: gleichmäßig auf alle verteilen
        const sharedDeduction = deduction / 4
        technicalScore -= sharedDeduction
        seoScore -= sharedDeduction
        legalScore -= sharedDeduction
        uxDesignScore -= sharedDeduction
        break
    }
  })

  // Clamp auf 0-100
  return {
    technical: Math.max(0, Math.min(100, Math.round(technicalScore))),
    seo: Math.max(0, Math.min(100, Math.round(seoScore))),
    legal: Math.max(0, Math.min(100, Math.round(legalScore))),
    uxDesign: Math.max(0, Math.min(100, Math.round(uxDesignScore))),
  }
}

/**
 * Berechnet gewichteten Raw Overall Score
 * 
 * Gewichtung:
 * - technical: 35%
 * - seo: 20%
 * - legal: 20%
 * - uxDesign: 25%
 */
function calculateRawOverallScore(categoryScores: {
  technical: number
  seo: number
  legal: number
  uxDesign: number
}): number {
  return Math.round(
    categoryScores.technical * 0.35 +
    categoryScores.seo * 0.20 +
    categoryScores.legal * 0.20 +
    categoryScores.uxDesign * 0.25
  )
}

/**
 * Berechnet Penalty für High-Severity Issues
 * 
 * Pro High-Severity Issue: +5 Punkte Penalty
 */
function calculateHighSeverityPenalty(issues: CheckResult[]): number {
  if (!issues || !Array.isArray(issues)) return 0
  
  const highSeverityCount = issues.filter(
    issue => issue && issue.severity === 'high'
  ).length
  
  return highSeverityCount * 5
}

/**
 * Normalisiert den Raw Overall Score mit starker Stauchung
 * 
 * Formel: normalized = (rawOverall * rawOverall) / 100 - 5
 * 
 * Zielmapping:
 * - raw 50 -> final ~20-25
 * - raw 70 -> final ~45-50
 * - raw 80 -> final ~60-65
 * - raw 90 -> final ~76-82
 * - raw 100 -> final 95-100
 */
function normalizeScore(rawOverall: number): number {
  // Clamp auf 0-100
  const clamped = Math.max(0, Math.min(100, rawOverall))
  
  // Nichtlineare quadratische Stauchung + kleiner Offset
  const normalized = (clamped * clamped) / 100 - 5
  
  // Clamp auf 0-100 und runden
  return Math.round(Math.max(0, Math.min(100, normalized)))
}

/**
 * Wendet Normalisierung und Whitelist-Override an
 */
function normalizeAndApplyWhitelist(
  breakdown: ScoreBreakdown,
  url: string
): { finalScore: number; scoreRaw: number } {
  const scoreRaw = breakdown.rawOverall
  
  // Whitelist-Check: Falls Domain in SCANNER_ALWAYS_MAX_SCORE_DOMAINS
  if (url && isWhitelistedDomain(url)) {
    return {
      finalScore: 100,
      scoreRaw,
    }
  }
  
  // Normale Normalisierung
  const finalScore = normalizeScore(scoreRaw)
  
  return {
    finalScore,
    scoreRaw,
  }
}

/**
 * Berechnet strukturierten Score mit Aufschlüsselung nach Teilbereichen
 * 
 * Neues Scoring-System:
 * 1. Raw Scores pro Kategorie (technical, seo, legal, uxDesign) berechnen
 * 2. Gewichteten Raw Overall Score berechnen (technical 35%, seo 20%, legal 20%, uxDesign 25%)
 * 3. High-Severity Penalty anwenden (+5 pro high issue)
 * 4. Normalisierung anwenden (quadratische Stauchung - 5)
 * 5. Whitelist-Override (falls Domain whitelisted → 100)
 */
export function calculateScoreWithBreakdown(issues: CheckResult[]): ScoreBreakdown {
  // 1. Berechne Raw Scores pro Kategorie
  const categoryScores = calculateCategoryRawScores(issues)
  
  // 2. Berechne gewichteten Raw Overall Score
  let rawOverall = calculateRawOverallScore(categoryScores)
  
  // 3. Wende High-Severity Penalty an
  const penalty = calculateHighSeverityPenalty(issues)
  rawOverall = Math.max(0, rawOverall - penalty)
  
  // Clamp auf 0-100
  rawOverall = Math.max(0, Math.min(100, rawOverall))
  
  return {
    technical: categoryScores.technical,
    seo: categoryScores.seo,
    legal: categoryScores.legal,
    uxDesign: categoryScores.uxDesign,
    rawOverall,
  }
}

export function createSummary(issues: CheckResult[]): string {
  if (!issues || !Array.isArray(issues) || issues.length === 0) {
    return 'Ihre Website hat keine kritischen Probleme gefunden. Ausgezeichnet!'
  }

  const totalIssues = issues.length
  const criticalIssues = issues.filter((issue) => issue && issue.severity === 'high').length
  const mediumIssues = issues.filter((issue) => issue && issue.severity === 'medium').length
  const lowIssues = issues.filter((issue) => issue && issue.severity === 'low').length

  if (criticalIssues > 0) {
    return `Es wurden ${totalIssues} Problem${totalIssues !== 1 ? 'e' : ''} gefunden, davon ${criticalIssues} kritisch. Diese sollten schnellstmöglich behoben werden.`
  } else if (mediumIssues > 0) {
    return `Es wurden ${totalIssues} Problem${totalIssues !== 1 ? 'e' : ''} gefunden, davon ${mediumIssues} mittelschwer. Eine Behebung wird empfohlen.`
  } else {
    return `Es wurden ${totalIssues} kleinere Problem${totalIssues !== 1 ? 'e' : ''} gefunden. Diese können bei Gelegenheit optimiert werden.`
  }
}

/**
 * Prüft, ob eine URL zu einer Domain gehört, die immer Score 100 erhalten soll
 * 
 * @param url Die zu prüfende URL
 * @returns true, wenn die URL zu einer whitelisted Domain gehört
 */
function isWhitelistedDomain(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Prüfe auf exakte Übereinstimmung oder Domain-Match (mit/ohne www)
    for (const whitelistedDomain of SCANNER_ALWAYS_MAX_SCORE_DOMAINS) {
      const normalizedDomain = whitelistedDomain.toLowerCase().trim()
      
      // Exakte Übereinstimmung
      if (hostname === normalizedDomain) {
        return true
      }
      
      // Match ohne www (z.B. "sitesweep.de" matcht auch "www.sitesweep.de")
      if (normalizedDomain.startsWith('www.')) {
        const domainWithoutWww = normalizedDomain.substring(4)
        if (hostname === domainWithoutWww) {
          return true
        }
      } else {
        // Wenn whitelisted Domain ohne www, prüfe auch mit www
        if (hostname === `www.${normalizedDomain}`) {
          return true
        }
      }
    }
    
    return false
  } catch {
    // Ungültige URL = nicht whitelisted
    return false
  }
}

export function buildReport(crawl: CrawlResult | null | undefined, issues: CheckResult[]): ReportResult {
  // Validate inputs
  if (!crawl || !issues) {
    return {
      score: 0,
      scoreRaw: 0,
      summary: 'Fehler beim Erstellen des Reports',
      issues: [],
      scoreBreakdown: {
        technical: 0,
        seo: 0,
        legal: 0,
        uxDesign: 0,
        rawOverall: 0,
      },
    }
  }

  // Ensure issues is an array
  const validIssues = Array.isArray(issues) ? issues : []
  
  // Berechne Score mit Aufschlüsselung
  const breakdown = calculateScoreWithBreakdown(validIssues)
  
  // Wende Normalisierung und Whitelist-Override an
  const firstPageUrl = (crawl?.pages && Array.isArray(crawl.pages) && crawl.pages.length > 0) ? crawl.pages[0]?.url || '' : ''
  const normalized = normalizeAndApplyWhitelist(breakdown, firstPageUrl)
  
  // Aktualisiere Breakdown mit final Score
  const finalBreakdown: ScoreBreakdown = {
    technical: breakdown.technical,
    seo: breakdown.seo,
    legal: breakdown.legal,
    uxDesign: breakdown.uxDesign,
    rawOverall: breakdown.rawOverall,
  }

  const summary = createSummary(validIssues)
  
  // Select low hanging fruit issue
  const lowHangingFruit = selectLowHangingFruit(validIssues)

  return {
    score: normalized.finalScore, // Finaler Score (normalisiert, ggf. auf 100 überschrieben für whitelisted Domains)
    scoreRaw: normalized.scoreRaw, // Roh-Score vor Normalisierung
    summary: summary || 'Keine Zusammenfassung verfügbar',
    issues: validIssues,
    scoreBreakdown: finalBreakdown,
    lowHangingFruit: lowHangingFruit || undefined,
  }
}

export function generateReport(
  url: string,
  issues: CheckResult[]
): Report {
  const breakdown = calculateScoreWithBreakdown(issues)
  const normalized = normalizeAndApplyWhitelist(breakdown, url)
  
  return {
    id: `report_${Date.now()}`,
    url,
    createdAt: new Date(),
    score: normalized.finalScore,
    issues
  }
}

/**
 * Berechnet Score ohne Breakdown (für Rückwärtskompatibilität)
 * 
 * Veraltet: Verwende calculateScoreWithBreakdown für neue Implementierungen.
 */
function calculateScore(issues: CheckResult[]): number {
  const breakdown = calculateScoreWithBreakdown(issues)
  const normalized = normalizeAndApplyWhitelist(breakdown, '')
  return normalized.finalScore
}
