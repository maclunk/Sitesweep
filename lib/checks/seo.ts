/**
 * SEO Checks - Suchmaschinenoptimierung
 */

import { CrawlResult } from '../checks'

export interface CheckResult {
  id: string
  category: 'technical' | 'seo' | 'legal' | 'ux'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  pages: string[]
  evidence?: string
  recommendation?: string
  categoryScoreRaw?: number
  metadata?: Record<string, any>
}

/**
 * Prüft auf fehlende oder schlecht formatierte Title-Tags
 */
export function checkMissingTitle(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutTitle = crawlResult.pages.filter(p => !p.title || p.title.trim().length === 0)
  
  if (pagesWithoutTitle.length > 0) {
    results.push({
      id: 'seo-missing-title',
      category: 'seo',
      title: `${pagesWithoutTitle.length} Seite(n) ohne Title-Tag`,
      description: `Diese Seiten haben keinen Title-Tag, was sich negativ auf das SEO-Ranking auswirkt: ${pagesWithoutTitle.map(p => p.url).join(', ')}`,
      severity: 'high',
      pages: pagesWithoutTitle.map(p => p.url),
      evidence: 'Fehlender Title-Tag',
      recommendation: 'Jede Seite sollte einen eindeutigen, aussagekräftigen Title-Tag haben (50-60 Zeichen).',
      categoryScoreRaw: 0, // Kritisch für SEO
    })
  }
  
  // Prüfe auch auf Title-Tags außerhalb 20-60 Zeichen
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithBadTitleLength = crawlResult.pages.filter(p => {
    if (!p.title) return false
    const length = p.title.trim().length
    return length < 20 || length > 60
  })
  
  if (pagesWithBadTitleLength.length > 0) {
    const severity = pagesWithBadTitleLength.length > 2 ? 'medium' : 'low'
    results.push({
      id: 'seo-title-length',
      category: 'seo',
      title: `${pagesWithBadTitleLength.length} Seite(n) mit ungünstiger Title-Länge`,
      description: `Diese Seiten haben Title-Tags außerhalb des optimalen Bereichs (< 20 oder > 60 Zeichen).`,
      severity,
      pages: pagesWithBadTitleLength.map(p => p.url),
      evidence: `Title-Tags außerhalb 20-60 Zeichen`,
      recommendation: 'Optimieren Sie Title-Tags auf 20-60 Zeichen für beste Suchergebnis-Darstellung.',
      categoryScoreRaw: severity === 'medium' ? Math.max(0, 100 - (pagesWithBadTitleLength.length * 8)) : Math.max(0, 100 - (pagesWithBadTitleLength.length * 3)),
    })
  }
  
  return results
}

/**
 * Prüft auf fehlende oder schlecht formatierte Meta-Descriptions
 */
export function checkMissingMetaDescription(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutMeta = crawlResult.pages.filter(p => !p.metaDescription || p.metaDescription.trim().length === 0)
  
  if (pagesWithoutMeta.length > 0) {
    results.push({
      id: 'seo-missing-meta-description',
      category: 'seo',
      title: `${pagesWithoutMeta.length} Seite(n) ohne Meta-Description`,
      description: `Diese Seiten haben keine Meta-Description, was die Klickrate in Suchergebnissen reduzieren kann: ${pagesWithoutMeta.map(p => p.url).join(', ')}`,
      severity: 'medium',
      pages: pagesWithoutMeta.map(p => p.url),
      evidence: 'Fehlende Meta-Description',
      recommendation: 'Fügen Sie aussagekräftige Meta-Descriptions hinzu (150-160 Zeichen).',
      categoryScoreRaw: Math.max(0, 100 - (pagesWithoutMeta.length * 10)),
    })
  }
  
  // Prüfe auch auf Meta-Descriptions außerhalb 60-160 Zeichen
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithBadMetaLength = crawlResult.pages.filter(p => {
    if (!p.metaDescription) return false
    const length = p.metaDescription.trim().length
    return length < 60 || length > 160
  })
  
  if (pagesWithBadMetaLength.length > 0) {
    const severity = pagesWithBadMetaLength.length > 2 ? 'medium' : 'low'
    results.push({
      id: 'seo-meta-description-length',
      category: 'seo',
      title: `${pagesWithBadMetaLength.length} Seite(n) mit ungünstiger Meta-Description-Länge`,
      description: `Diese Seiten haben Meta-Descriptions außerhalb des optimalen Bereichs (60-160 Zeichen).`,
      severity,
      pages: pagesWithBadMetaLength.map(p => p.url),
      evidence: `Meta-Descriptions außerhalb 60-160 Zeichen`,
      recommendation: 'Optimieren Sie Meta-Descriptions auf 60-160 Zeichen für beste Suchergebnis-Darstellung.',
      categoryScoreRaw: severity === 'medium' ? Math.max(0, 100 - (pagesWithBadMetaLength.length * 8)) : Math.max(0, 100 - (pagesWithBadMetaLength.length * 3)),
    })
  }
  
  return results
}

/**
 * Prüft auf mehrere H1-Tags
 */
export function checkMultipleH1(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithMultipleH1 = crawlResult.pages.filter(p => (p.h1Count || 0) > 1)
  
  if (pagesWithMultipleH1.length > 0) {
    results.push({
      id: 'seo-multiple-h1',
      category: 'seo',
      title: `${pagesWithMultipleH1.length} Seite(n) mit mehreren H1-Tags`,
      description: `Diese Seiten haben mehrere H1-Tags, was die SEO-Struktur verschlechtert: ${pagesWithMultipleH1.map(p => p.url).join(', ')}`,
      severity: 'low',
      pages: pagesWithMultipleH1.map(p => p.url),
      evidence: 'Mehrere H1-Tags pro Seite',
      recommendation: 'Jede Seite sollte nur einen H1-Tag haben, der die Hauptüberschrift enthält.',
      categoryScoreRaw: Math.max(0, 100 - (pagesWithMultipleH1.length * 5)),
    })
  }
  
  return results
}

/**
 * Prüft auf fehlende H1-Tags
 */
export function checkMissingH1(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutH1 = crawlResult.pages.filter(p => (p.h1Count || 0) === 0)
  
  if (pagesWithoutH1.length > 0) {
    results.push({
      id: 'seo-missing-h1',
      category: 'seo',
      title: `${pagesWithoutH1.length} Seite(n) ohne H1-Tag`,
      description: `Diese Seiten haben keinen H1-Tag, was die SEO-Struktur verschlechtert: ${pagesWithoutH1.map(p => p.url).join(', ')}`,
      severity: 'medium',
      pages: pagesWithoutH1.map(p => p.url),
      evidence: 'Fehlender H1-Tag',
      recommendation: 'Jede Seite sollte einen H1-Tag mit der Hauptüberschrift haben.',
      categoryScoreRaw: Math.max(0, 100 - (pagesWithoutH1.length * 10)),
    })
  }
  
  return results
}

/**
 * Prüft auf robots.txt
 */
export async function checkRobotsTxt(crawlResult: CrawlResult): Promise<CheckResult[]> {
  // robots.txt Check wird im Crawler bereits gemacht
  return []
}

/**
 * Prüft auf sitemap.xml
 */
export async function checkSitemapXml(crawlResult: CrawlResult): Promise<CheckResult[]> {
  if (!crawlResult?.pages || crawlResult.pages.length === 0) return []
  
  const baseUrl = crawlResult.pages[0]?.url
  if (!baseUrl) return []
  
  try {
    const url = new URL(baseUrl)
    const sitemapUrl = `${url.origin}/sitemap.xml`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    try {
      const response = await fetch(sitemapUrl, {
        method: 'HEAD',
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      
      if (response.ok && response.status < 400) {
        return [] // Sitemap vorhanden
      }
    } catch {
      clearTimeout(timeoutId)
    }
    
    // Sitemap nicht gefunden
    return [{
      id: 'seo-missing-sitemap',
      category: 'seo',
      title: 'Sitemap.xml nicht gefunden',
      description: 'Eine sitemap.xml wurde nicht gefunden. Dies kann die Indexierung durch Suchmaschinen erschweren.',
      severity: 'low',
      pages: [baseUrl],
      evidence: 'Keine sitemap.xml gefunden',
      recommendation: 'Erstellen Sie eine sitemap.xml und registrieren Sie sie in der Google Search Console.',
      categoryScoreRaw: 85, // Leichter Abzug
    }]
  } catch {
    return []
  }
}

/**
 * Prüft auf fehlende Alt-Tags bei Bildern (SEO)
 */
export function checkMissingAltTags(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  // Diese Prüfung benötigt HTML-Analyse
  // Wird in der bestehenden checks.ts implementiert
  return []
}

/**
 * Prüft auf Duplicate Titles über Pages
 */
export function checkDuplicateTitles(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  const results: CheckResult[] = []
  
  // Gruppiere Seiten nach Title
  const pagesByTitle = new Map<string, string[]>()
  
  for (const page of crawlResult.pages) {
    if (!page.title || page.title.trim().length === 0) continue
    
    const title = page.title.trim().toLowerCase()
    if (!pagesByTitle.has(title)) {
      pagesByTitle.set(title, [])
    }
    pagesByTitle.get(title)!.push(page.url)
  }
  
  // Finde Duplikate
  const duplicateTitles: string[] = []
  for (const [title, urls] of pagesByTitle.entries()) {
    if (urls.length > 1) {
      duplicateTitles.push(...urls)
    }
  }
  
  if (duplicateTitles.length > 0) {
    const duplicateCount = pagesByTitle.size - Array.from(pagesByTitle.values()).filter(urls => urls.length === 1).length
    results.push({
      id: 'seo-duplicate-titles',
      category: 'seo',
      title: `${duplicateCount} doppelte Title-Tags gefunden`,
      description: `Mehrere Seiten verwenden denselben Title-Tag. Dies kann zu SEO-Problemen führen.`,
      severity: 'medium',
      pages: duplicateTitles.slice(0, 5),
      evidence: `${duplicateCount} doppelte Title-Tags über ${duplicateTitles.length} Seiten`,
      recommendation: 'Jede Seite sollte einen eindeutigen Title-Tag haben. Vermeiden Sie Duplikate.',
      categoryScoreRaw: Math.max(0, 100 - (duplicateCount * 8)),
    })
  }
  
  return results
}

/**
 * Prüft auf zu wenig Text auf wichtigen Seiten
 */
export function checkLowWordCount(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  const results: CheckResult[] = []
  const pagesWithLowWordCount: string[] = []
  
  for (const page of crawlResult.pages) {
    const wordCount = page.wordCount || 0
    // Wichtige Seiten (Startseite, Hauptseiten) sollten mindestens 300 Wörter haben
    const urlMatch = page.url.match(/\/$|^https?:\/\/[^\/]+\/?$/i)
    const isImportantPage = (urlMatch !== null && urlMatch.length > 0) || (page.h1?.length || 0) > 0
    
    if (isImportantPage && wordCount < 200) {
      pagesWithLowWordCount.push(page.url)
    }
  }
  
  if (pagesWithLowWordCount.length > 0) {
    const severity = pagesWithLowWordCount.length > 2 ? 'medium' : 'low'
    results.push({
      id: 'seo-low-word-count',
      category: 'seo',
      title: `${pagesWithLowWordCount.length} wichtige Seite(n) mit zu wenig Text`,
      description: `Diese wichtigen Seiten (z.B. Startseite) haben weniger als 200 Wörter. Ausreichender Content ist wichtig für SEO.`,
      severity,
      pages: pagesWithLowWordCount,
      evidence: `Wichtige Seiten mit weniger als 200 Wörtern`,
      recommendation: 'Erweitern Sie den Text-Inhalt auf wichtigen Seiten (mindestens 300-500 Wörter) für besseres SEO.',
      categoryScoreRaw: severity === 'medium' ? Math.max(0, 100 - (pagesWithLowWordCount.length * 8)) : Math.max(0, 100 - (pagesWithLowWordCount.length * 3)),
    })
  }
  
  return results
}

/**
 * Führt alle SEO Checks aus
 */
export async function runSeoChecks(crawlResult: CrawlResult): Promise<CheckResult[]> {
  const results: CheckResult[] = []
  
  results.push(...checkMissingTitle(crawlResult))
  results.push(...checkMissingMetaDescription(crawlResult))
  results.push(...checkMultipleH1(crawlResult))
  results.push(...checkMissingH1(crawlResult))
  results.push(...(await checkSitemapXml(crawlResult)))
  
  // Neue Checks
  results.push(...checkDuplicateTitles(crawlResult))
  results.push(...checkLowWordCount(crawlResult))
  
  return results
}

