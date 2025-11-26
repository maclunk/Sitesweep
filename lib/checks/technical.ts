/**
 * Technical Checks - Technische Prüfungen
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
  categoryScoreRaw?: number // 0-100
  metadata?: Record<string, any>
}

/**
 * Prüft auf 404-Seiten
 */
export function check404Pages(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pages404 = crawlResult.pages.filter(p => p.status === 404)
  
  if (pages404.length > 0) {
    results.push({
      id: 'technical-404-pages',
      category: 'technical',
      title: `${pages404.length} Seite(n) mit 404-Fehler gefunden`,
      description: `Folgende Seiten sind nicht erreichbar (404): ${pages404.map(p => p.url).join(', ')}`,
      severity: 'high',
      pages: pages404.map(p => p.url),
      evidence: `${pages404.length} Seiten mit HTTP 404`,
      recommendation: 'Prüfen Sie die Links auf Ihrer Website und entfernen oder korrigieren Sie fehlerhafte Verweise.',
      categoryScoreRaw: Math.max(0, 100 - (pages404.length * 10)),
    })
  }
  
  return results
}

/**
 * Prüft SSL-Verschlüsselung
 */
export function checkSSL(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutSSL = crawlResult.pages.filter(p => {
    try {
      const url = new URL(p.url)
      return url.protocol === 'http:'
    } catch {
      return false
    }
  })
  
  if (pagesWithoutSSL.length > 0) {
    results.push({
      id: 'technical-no-ssl',
      category: 'technical',
      title: 'Fehlende SSL-Verschlüsselung',
      description: `${pagesWithoutSSL.length} Seite(n) verwenden kein HTTPS. Dies ist ein Sicherheitsrisiko und wirkt sich negativ auf das SEO-Ranking aus.`,
      severity: 'high',
      pages: pagesWithoutSSL.map(p => p.url),
      evidence: `${pagesWithoutSSL.length} Seiten ohne HTTPS`,
      recommendation: 'Aktivieren Sie SSL/TLS-Zertifikate für Ihre gesamte Website und leiten Sie HTTP-Traffic automatisch zu HTTPS um.',
      categoryScoreRaw: 0, // Kritisch, daher 0
    })
  }
  
  return results
}

/**
 * Prüft Ladezeiten (basierend auf HTML-Größe als Proxy)
 */
export function checkLoadTime(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const largePages = crawlResult.pages.filter(p => {
    const htmlSize = p.html ? Buffer.byteLength(p.html, 'utf8') : 0
    return htmlSize > 500 * 1024 // > 500 KB
  })
  
  if (largePages.length > 0) {
    results.push({
      id: 'technical-large-pages',
      category: 'technical',
      title: `${largePages.length} sehr große Seite(n) gefunden`,
      description: `Diese Seiten sind sehr groß (> 500 KB) und können langsam laden: ${largePages.map(p => p.url).join(', ')}`,
      severity: 'medium',
      pages: largePages.map(p => p.url),
      evidence: `Seiten größer als 500 KB`,
      recommendation: 'Optimieren Sie die Seiten-Größe durch Code-Minimierung, komprimierte Bilder und lazy loading.',
      categoryScoreRaw: Math.max(0, 100 - (largePages.length * 15)),
    })
  }
  
  return results
}

/**
 * Prüft große Bilder
 */
export function checkLargeImages(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const largeImages: { url: string; image: { src: string; size: number } }[] = []
  
  crawlResult.pages.forEach((page: any) => {
    if (!page?.url) return
    page.images?.forEach((img: any) => {
      if (img?.size > 500 * 1024) { // > 500 KB
        largeImages.push({ url: page.url, image: img })
      }
    })
  })
  
  if (largeImages.length > 0) {
    results.push({
      id: 'technical-large-images',
      category: 'technical',
      title: `${largeImages.length} sehr große Bild(er) gefunden`,
      description: `Diese Bilder sind sehr groß (> 500 KB) und verlangsamen das Laden: ${largeImages.slice(0, 5).map(li => li.image.src).join(', ')}${largeImages.length > 5 ? '...' : ''}`,
      severity: 'medium',
      pages: [...new Set(largeImages.map(li => li.url))],
      evidence: `${largeImages.length} Bilder größer als 500 KB`,
      recommendation: 'Komprimieren Sie Bilder oder verwenden Sie moderne Formate wie WebP. Bilder sollten vor dem Upload optimiert werden.',
      categoryScoreRaw: Math.max(0, 100 - (largeImages.length * 5)),
    })
  }
  
  return results
}

/**
 * Prüft auf fehlende Alt-Tags
 */
export function checkMissingAltTags(crawlResult: CrawlResult): CheckResult[] {
  // Diese Prüfung benötigt HTML-Analyse - wird in der Checks-Logik erweitert
  return []
}

/**
 * Prüft fehlende responsive Meta-Tags
 */
export function checkMissingResponsiveMeta(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutViewport = crawlResult.pages.filter(p => {
    return !p.meta?.viewport && !p.meta?.['og:image'] // Einfache Prüfung
  })
  
  if (pagesWithoutViewport.length > 0) {
    results.push({
      id: 'technical-missing-responsive-meta',
      category: 'technical',
      title: `${pagesWithoutViewport.length} Seite(n) ohne responsive Meta-Tag`,
      description: `Diese Seiten haben kein viewport Meta-Tag und werden auf Mobilgeräten nicht optimal angezeigt: ${pagesWithoutViewport.map(p => p.url).join(', ')}`,
      severity: 'high',
      pages: pagesWithoutViewport.map(p => p.url),
      evidence: 'Fehlendes viewport Meta-Tag',
      recommendation: 'Fügen Sie <meta name="viewport" content="width=device-width, initial-scale=1"> im <head> ein.',
      categoryScoreRaw: 40, // Starker Abzug für fehlende Mobile-Optimierung
    })
  }
  
  return results
}

/**
 * Prüft auf Console-Errors
 */
export function checkConsoleErrors(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithErrors = crawlResult.pages.filter(p => p.errors && p.errors.length > 0)
  
  if (pagesWithErrors.length > 0) {
    const totalErrors = pagesWithErrors.reduce((sum, p) => sum + (p.errors?.length || 0), 0)
    results.push({
      id: 'technical-console-errors',
      category: 'technical',
      title: `${totalErrors} JavaScript-Fehler gefunden`,
      description: `Auf folgenden Seiten wurden JavaScript-Fehler in der Browser-Konsole festgestellt: ${pagesWithErrors.map(p => p.url).join(', ')}`,
      severity: totalErrors > 5 ? 'high' : 'medium',
      pages: pagesWithErrors.map(p => p.url),
      evidence: `${totalErrors} Console-Errors`,
      recommendation: 'Beheben Sie JavaScript-Fehler, um eine reibungslose Funktionalität sicherzustellen.',
      categoryScoreRaw: Math.max(0, 100 - (totalErrors * 5)),
    })
  }
  
  return results
}

/**
 * Prüft auf sehr große HTML-Dateien
 */
export function checkLargeHtmlSize(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const largeHtmlPages = crawlResult.pages.filter(p => {
    if (!p.html) return false
    const size = Buffer.byteLength(p.html, 'utf8')
    return size > 500 * 1024 // > 500 KB
  })
  
  if (largeHtmlPages.length > 0) {
    results.push({
      id: 'technical-large-html-size',
      category: 'technical',
      title: `${largeHtmlPages.length} sehr große HTML-Datei(en)`,
      description: `Diese HTML-Dateien sind sehr groß (> 500 KB) und können die Ladezeit deutlich erhöhen: ${largeHtmlPages.map(p => p.url).join(', ')}`,
      severity: 'medium',
      pages: largeHtmlPages.map(p => p.url),
      evidence: `HTML größer als 500 KB`,
      recommendation: 'Minimieren Sie HTML-Code, entfernen Sie unnötige Kommentare und optimieren Sie die Struktur.',
      categoryScoreRaw: Math.max(0, 100 - (largeHtmlPages.length * 10)),
    })
  }
  
  return results
}

/**
 * Prüft auf zu viele externe Scripts
 */
export function checkExcessiveScripts(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithManyScripts = crawlResult.pages.filter(p => (p.scriptCount || 0) > 15)
  
  if (pagesWithManyScripts.length > 0) {
    results.push({
      id: 'technical-excessive-scripts',
      category: 'technical',
      title: `${pagesWithManyScripts.length} Seite(n) mit vielen externen Scripts`,
      description: `Diese Seiten laden viele externe JavaScript-Dateien (> 15), was die Ladezeit verlangsamen kann: ${pagesWithManyScripts.map(p => p.url).join(', ')}`,
      severity: 'medium',
      pages: pagesWithManyScripts.map(p => p.url),
      evidence: `Mehr als 15 externe Scripts`,
      recommendation: 'Bündeln Sie JavaScript-Dateien und minimieren Sie die Anzahl externer Skripte.',
      categoryScoreRaw: Math.max(0, 100 - (pagesWithManyScripts.length * 8)),
    })
  }
  
  return results
}

/**
 * Prüft auf Redirect-Ketten > 2
 */
export function checkRedirectChains(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithLongChains = crawlResult.pages.filter(p => {
    const chainLength = p.redirectChain?.length || 0
    return chainLength > 2
  })
  
  if (pagesWithLongChains.length > 0) {
    results.push({
      id: 'technical-long-redirect-chains',
      category: 'technical',
      title: `${pagesWithLongChains.length} Seite(n) mit langen Redirect-Ketten`,
      description: `Diese Seiten haben mehr als 2 Weiterleitungen (Redirects), was die Performance beeinträchtigen kann: ${pagesWithLongChains.slice(0, 3).map(p => p.url).join(', ')}`,
      severity: 'medium',
      pages: pagesWithLongChains.map(p => p.url),
      evidence: `Redirect-Ketten mit mehr als 2 Weiterleitungen`,
      recommendation: 'Vermeiden Sie lange Redirect-Ketten. Leiten Sie direkt zur finalen URL um (301 Redirect).',
      categoryScoreRaw: Math.max(0, 100 - (pagesWithLongChains.length * 8)),
    })
  }
  
  return results
}

/**
 * Prüft auf fehlende Canonical-Tags bei Duplicate-Paths
 */
export function checkMissingCanonical(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutCanonical: string[] = []
  
  // Gruppiere Seiten nach normalisiertem Pfad (ohne Query-Parameter)
  const pagesByPath = new Map<string, string[]>()
  
  for (const page of crawlResult.pages) {
    try {
      const url = new URL(page.url)
      const normalizedPath = `${url.protocol}//${url.host}${url.pathname}`
      
      if (!pagesByPath.has(normalizedPath)) {
        pagesByPath.set(normalizedPath, [])
      }
      pagesByPath.get(normalizedPath)!.push(page.url)
    } catch {
      continue
    }
  }
  
  // Prüfe Seiten ohne Canonical-Tag, besonders bei möglichen Duplikaten
  for (const page of crawlResult.pages) {
    // Seiten ohne Canonical-Tag sind problematisch, besonders wenn andere Seiten auf denselben Pfad zeigen
    if (!page.canonical) {
      try {
        const url = new URL(page.url)
        const normalizedPath = `${url.protocol}//${url.host}${url.pathname}`
        const pagesWithSamePath = pagesByPath.get(normalizedPath) || []
        
        // Wenn mehrere Seiten auf denselben Pfad zeigen (z.B. mit/ohne Query-Parameter), fehlt Canonical
        if (pagesWithSamePath.length > 1 || url.search.length > 0) {
          pagesWithoutCanonical.push(page.url)
        }
      } catch {
        continue
      }
    }
  }
  
  if (pagesWithoutCanonical.length > 0) {
    const severity = pagesWithoutCanonical.length > 3 ? 'medium' : 'low'
    results.push({
      id: 'technical-missing-canonical',
      category: 'technical',
      title: `${pagesWithoutCanonical.length} Seite(n) ohne Canonical-Tag`,
      description: `Diese Seiten haben keinen Canonical-Tag, besonders bei Duplicate-URLs (z.B. mit/ohne Query-Parameter). Dies kann zu Duplicate-Content-Problemen führen.`,
      severity,
      pages: pagesWithoutCanonical.slice(0, 5),
      evidence: `Seiten ohne Canonical-Tag, besonders bei möglichen Duplikaten`,
      recommendation: 'Fügen Sie <link rel="canonical" href="..."> im <head> jeder Seite hinzu, um Duplicate-Content zu vermeiden.',
      categoryScoreRaw: severity === 'medium' ? Math.max(0, 100 - (pagesWithoutCanonical.length * 8)) : Math.max(0, 100 - (pagesWithoutCanonical.length * 3)),
    })
  }
  
  return results
}

/**
 * Prüft auf große Images ohne lazy-loading oder ohne width/height
 */
export function checkImagesWithoutOptimization(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithUnoptimizedImages: string[] = []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    if (!html) continue
    
    // Suche nach großen Bildern (> 100 KB geschätzt oder > 500px Breite)
    const largeImages = page.images?.filter((img: any) => img?.size > 100 * 1024) || []
    
    if (largeImages.length === 0) continue
    
    let hasUnoptimizedImages = false
    
    // Prüfe HTML auf lazy-loading und width/height für diese Bilder
    for (const img of largeImages.slice(0, 5)) { // Max 5 prüfen
      const imgSrc = img.src
      // Suche nach img-Tag mit diesem src
      const imgTagRegex = new RegExp(`<img[^>]*src=["']([^"']*${imgSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*)["'][^>]*>`, 'i')
      const match = html.match(imgTagRegex)
      
      if (match) {
        const imgTag = match[0]
        const hasLazy = /loading=["']lazy["']/i.test(imgTag)
        const hasWidth = /width=["']?\d+["']?/i.test(imgTag)
        const hasHeight = /height=["']?\d+["']?/i.test(imgTag)
        
        // Wenn weder lazy-loading noch width/height vorhanden
        if (!hasLazy && (!hasWidth || !hasHeight)) {
          hasUnoptimizedImages = true
          break
        }
      }
    }
    
    if (hasUnoptimizedImages) {
      pagesWithUnoptimizedImages.push(page.url)
    }
  }
  
  if (pagesWithUnoptimizedImages.length > 0) {
    results.push({
      id: 'technical-unoptimized-images',
      category: 'technical',
      title: `${pagesWithUnoptimizedImages.length} Seite(n) mit unoptimierten Bildern`,
      description: `Diese Seiten enthalten große Bilder ohne lazy-loading oder ohne width/height-Attribute, was die Ladezeit beeinträchtigt.`,
      severity: 'medium',
      pages: pagesWithUnoptimizedImages,
      evidence: `Große Bilder ohne lazy-loading oder ohne width/height`,
      recommendation: 'Fügen Sie lazy-loading (loading="lazy") und width/height-Attribute zu großen Bildern hinzu, um Layout-Shifts zu vermeiden.',
      categoryScoreRaw: Math.max(0, 100 - (pagesWithUnoptimizedImages.length * 8)),
    })
  }
  
  return results
}

/**
 * Prüft auf HTTP/2 oder HTTP/3 (nur Hinweis, low severity)
 */
export function checkHttpVersion(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutHttp2: string[] = []
  
  // Hinweis: Diese Prüfung ist vereinfacht, da wir die HTTP-Version aus dem Response nicht direkt haben
  // Wir können nur einen Hinweis geben, dass HTTP/2 oder HTTP/3 empfohlen wird
  // Da moderne Websites meist HTTP/2 nutzen, geben wir nur einen Hinweis, keine harte Prüfung
  
  // Prüfe ob es Indikatoren für veraltete HTTP-Version gibt (z.B. sehr schlechte Performance)
  const slowPages = crawlResult.pages.filter(p => {
    const timings = p.timings
    return timings && (timings.ttfb || 0) > 2000 // TTFB > 2s könnte auf HTTP/1.1 hindeuten
  })
  
  if (slowPages.length > 2) {
    results.push({
      id: 'technical-http-version-hint',
      category: 'technical',
      title: 'HTTP/2 oder HTTP/3 könnte Performance verbessern',
      description: `Die langsameren Response-Zeiten könnten auf HTTP/1.1 hindeuten. HTTP/2 oder HTTP/3 kann die Performance deutlich verbessern.`,
      severity: 'low',
      pages: slowPages.slice(0, 3).map(p => p.url),
      evidence: `Langsame Response-Zeiten (TTFB > 2s)`,
      recommendation: 'Erwägen Sie HTTP/2 oder HTTP/3 für bessere Performance. Sprechen Sie mit Ihrem Hosting-Provider.',
      categoryScoreRaw: 95, // Nur leichter Hinweis
    })
  }
  
  return results
}

/**
 * Führt alle Technical Checks aus
 */
export function runTechnicalChecks(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  results.push(...check404Pages(crawlResult))
  results.push(...checkSSL(crawlResult))
  results.push(...checkLoadTime(crawlResult))
  results.push(...checkLargeImages(crawlResult))
  results.push(...checkMissingResponsiveMeta(crawlResult))
  results.push(...checkConsoleErrors(crawlResult))
  results.push(...checkLargeHtmlSize(crawlResult))
  results.push(...checkExcessiveScripts(crawlResult))
  
  // Neue Checks
  results.push(...checkRedirectChains(crawlResult))
  results.push(...checkMissingCanonical(crawlResult))
  results.push(...checkImagesWithoutOptimization(crawlResult))
  results.push(...checkHttpVersion(crawlResult))
  
  return results
}

