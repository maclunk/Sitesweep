import { normalizeUrl, sameDomain } from './utils'
import { SAFE_MODE } from './config'
import { checkBrokenInternalLinks } from './checks/brokenLinks'
import { runUxDesignChecks } from './checks/uxDesign'

// Minimal CrawlResult type (crawler.ts removed for Vercel compatibility)
export interface CrawlResult {
  pages?: Array<{ url: string; [key: string]: any }>
  [key: string]: any
}

export interface CheckResult {
  id: string
  category: 'technical' | 'seo' | 'legal' | 'ux'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  pages: string[]
}

export async function runChecks(crawlResult: CrawlResult): Promise<CheckResult[]> {
  // Validate input
  if (!crawlResult || !crawlResult.pages || !Array.isArray(crawlResult.pages)) {
    return []
  }

  // SAFE MODE: Statische Beispiel-Issues zurückgeben
  if (SAFE_MODE) {
    console.log('[Checks] SAFE_MODE active - returning dummy issues')
    
    const firstPage = crawlResult.pages[0]
    const pageUrl = firstPage?.url || 'unknown'
    
    return [
      {
        id: 'safe-mode-example-1',
        category: 'seo',
        title: 'Dies ist ein Beispielproblem im SAFE MODE',
        description: 'Im SAFE MODE werden vereinfachte Beispiel-Issues angezeigt. Setze SAFE_MODE = false für vollständige Analyse.',
        severity: 'medium',
        pages: [pageUrl],
      },
      {
        id: 'safe-mode-example-2',
        category: 'ux',
        title: 'Zweites Beispielproblem',
        description: 'Dies ist ein weiteres Beispiel-Problem, um die Funktionalität zu testen.',
        severity: 'low',
        pages: [pageUrl],
      },
    ]
  }

  // Gesamt-Timeout für alle Checks: 60 Sekunden
  const CHECKS_TIMEOUT = 60 * 1000

  const checksPromise = (async (): Promise<CheckResult[]> => {
    // Vollständige Checks (nur wenn SAFE_MODE = false)
    const results: CheckResult[] = []

    try {
      // A) Technical Checks
      results.push(...check404Pages(crawlResult))
      
      // Broken Links Check mit eigenem Timeout (max. 20 Sekunden)
      try {
        const brokenLinksPromise = checkBrokenInternalLinks(crawlResult)
        const brokenLinksTimeout = new Promise<CheckResult[]>((_, reject) =>
          setTimeout(() => reject(new Error('Broken links check timeout')), 20000)
        )
        results.push(...(await Promise.race([brokenLinksPromise, brokenLinksTimeout])))
      } catch (linkCheckError) {
        console.warn('[Checks] Broken links check timed out or failed:', linkCheckError)
        // Continue with other checks
      }
      
      // Technical Checks (inkl. neue Checks: Redirect-Chains, Canonical, Images-optimization, HTTP-Version)
      const { runTechnicalChecks } = await import('./checks/technical')
      results.push(...runTechnicalChecks(crawlResult))

      // B) SEO Checks (inkl. neue Checks: Title-Length, Meta-Description-Length, Duplicate-Titles, Low-Word-Count)
      const { runSeoChecks } = await import('./checks/seo')
      const seoResults = await runSeoChecks(crawlResult)
      results.push(...seoResults)
      
      // Legacy SEO Checks (falls vorhanden)
      results.push(...checkMultipleH1(crawlResult))
      results.push(...checkCanonicalTag(crawlResult))
      results.push(...checkOpenGraphTags(crawlResult))
      results.push(...checkHtmlLangAttribute(crawlResult))

      // C) Legal Checks (inkl. neue Checks: Cookie-Banner, External-Fonts)
      const { runLegalChecks } = await import('./checks/legal')
      results.push(...runLegalChecks(crawlResult))
      
      // Legacy Legal Checks (falls vorhanden)
      results.push(...checkGoogleFonts(crawlResult))

      // D) UX Checks
      results.push(...checkClickablePhone(crawlResult))
      results.push(...checkOpeningHours(crawlResult))
      results.push(...checkCTAButton(crawlResult))
      results.push(...checkContactPage(crawlResult))
      results.push(...checkGoogleMaps(crawlResult))
      results.push(...checkPrimaryCTA(crawlResult))
      results.push(...checkFavicon(crawlResult))
      
      // UX/Design Modernitäts-Check (neue umfassende Kategorie)
      try {
        if (!crawlResult.pages || !Array.isArray(crawlResult.pages) || crawlResult.pages.length === 0) {
          // Skip UX checks if no pages available
          return []
        }
        
        const siteMeta = {
          totalPages: crawlResult.pages.length,
          avgWordCount: crawlResult.pages.reduce((sum, p) => sum + (p.wordCount || 0), 0) / crawlResult.pages.length || 0,
          avgScriptCount: crawlResult.pages.reduce((sum, p) => sum + (p.scriptCount || 0), 0) / crawlResult.pages.length || 0,
        }
        const uxDesignResult = runUxDesignChecks(crawlResult, siteMeta)
        // Füge alle UX/Design Issues hinzu (categoryScoreRaw ist bereits in allen Issues gesetzt)
        results.push(...uxDesignResult.issues)
      } catch (uxError) {
        console.warn('[Checks] UX/Design checks failed:', uxError)
        // Fallback: Verwende alte checkOutdatedDesign wenn neue Checks fehlschlagen
        results.push(...checkOutdatedDesign(crawlResult))
      }
    } catch (error) {
      console.error('Error running checks:', error)
      // Return partial results if some checks fail
    }

    return results
  })()

  // Gesamt-Timeout für alle Checks
  const timeoutPromise = new Promise<CheckResult[]>((_, reject) =>
    setTimeout(() => reject(new Error('Checks timeout after 60 seconds')), CHECKS_TIMEOUT)
  )

  try {
    return await Promise.race([checksPromise, timeoutPromise])
  } catch (error) {
    console.error('[Checks] Checks timed out or failed:', error)
    // Return empty array or partial results on timeout
    return []
  }
}

// A) Technical Checks

function check404Pages(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pages404 = crawlResult.pages.filter((p) => p && typeof p.status === 'number' && p.status === 404)
  if (pages404.length === 0) return []

  return [
    {
      id: '404-pages',
      category: 'technical',
      title: 'Fehlende Seiten (404)',
      description: `${pages404.length} Seite${pages404.length !== 1 ? 'n' : ''} konnte${pages404.length === 1 ? '' : 'n'} nicht gefunden werden.`,
      severity: 'high',
      pages: pages404.map((p) => p?.url || '').filter(Boolean),
    },
  ]
}

/**
 * Prüft einen einzelnen internen Link per HTTP-Request
 * @param url Die zu prüfende URL (sollte die ORIGINALE URL sein, nicht normalisiert)
 * @param baseUrl Die Basis-URL für Domain-Vergleich
 * @returns "ok" = Link funktioniert, "broken" = 404/410, "skip" = sollte ignoriert werden, "unknown" = konnte nicht geprüft werden
 */
async function checkInternalLink(url: string, baseUrl: string): Promise<'ok' | 'broken' | 'skip' | 'unknown'> {
  try {
    // WICHTIG: Teste die ORIGINALE URL, nicht eine normalisierte Version
    // Manche Server sind empfindlich bezüglich trailing slashes, query params, etc.
    
    // ROBUSTER ANSATZ: Versuche mehrere Methoden, um sicherzustellen, dass die Seite wirklich nicht existiert
    
    // Methode 1: GET-Request mit vollständigen Browser-Headers
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 Sekunden Timeout (reduziert von 5)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow', // WICHTIG: Redirects automatisch folgen
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      })
      
      clearTimeout(timeoutId)
      
      const status = response.status
      const finalUrl = response.url // Finale URL nach Redirects
      
      // Debug-Logging
      if (status === 404 || status === 410) {
        console.log(`[Link-Check] BROKEN: ${url} -> Status: ${status}, Final URL: ${finalUrl}`)
      }
      
      // 2xx und 3xx = OK (Seite existiert und ist erreichbar)
      // WICHTIG: Auch 3xx (Redirects) sind OK - die Seite existiert, sie leitet nur um
      if (status >= 200 && status < 400) {
        return 'ok'
      }
      
      // 404 und 410 = echte Broken Links
      if (status === 404 || status === 410) {
        // ZUSÄTZLICHE PRÜFUNG: Manche Server geben 404, obwohl die Seite existiert
        // Prüfe die finale URL nach Redirects - wenn sie sich geändert hat, ist es wahrscheinlich OK
        if (finalUrl && finalUrl !== url) {
          // URL wurde umgeleitet - prüfe ob die finale URL auf eine Fehlerseite zeigt
          const finalUrlLower = finalUrl.toLowerCase()
          const isErrorPage = finalUrlLower.includes('404') || 
                             finalUrlLower.includes('error') || 
                             finalUrlLower.includes('not-found') ||
                             finalUrlLower.includes('page-not-found')
          
          if (!isErrorPage) {
            // URL wurde umgeleitet zu einer anderen Seite - wahrscheinlich OK
            console.log(`[Link-Check] Redirect erkannt: ${url} -> ${finalUrl}, behandle als OK`)
            return 'ok'
          }
        }
        
        // ZUSÄTZLICHE SICHERHEIT: Prüfe auch den Response-Text (manche Server geben 200 mit 404-Inhalt)
        try {
          const text = await response.text()
          const textLower = text.toLowerCase()
          // Wenn der Response-Text eindeutig eine 404-Seite ist, ist es wirklich broken
          const is404Page = textLower.includes('404') && 
                           (textLower.includes('not found') || 
                            textLower.includes('nicht gefunden') ||
                            textLower.includes('seite nicht gefunden'))
          
          if (!is404Page && status === 404) {
            // Status ist 404, aber Inhalt sieht nicht nach 404-Seite aus - könnte ein False Positive sein
            console.log(`[Link-Check] 404 Status, aber Inhalt sieht nicht nach 404-Seite aus: ${url} - behandle als unknown`)
            return 'unknown'
          }
        } catch {
          // Text konnte nicht gelesen werden - vertraue auf Statuscode
        }
        
        return 'broken'
      }
      
      // 401/403 = Seite existiert, aber nicht öffentlich zugänglich (NICHT als broken werten)
      if (status === 401 || status === 403) {
        return 'skip' // Ignorieren, nicht als Fehler behandeln
      }
      
      // 5xx = Serverfehler, aber Seite existiert wahrscheinlich (NICHT als broken)
      if (status >= 500) {
        return 'skip'
      }
      
      // Andere 4xx Codes (außer 404/410) = nicht als broken werten
      return 'skip'
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      // Bei Fetch-Fehlern (CORS, Timeout, Network) - nicht als defekt markieren
      // Timeout/Network-Fehler bedeuten nicht, dass die Seite nicht existiert
      
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError)
      
      // Wenn es ein AbortError (Timeout) ist, behandle als "unknown", nicht als broken
      if (errorMessage.includes('aborted') || errorMessage.includes('timeout')) {
        console.log(`[Link-Check] Timeout bei ${url} - behandle als unknown, nicht als broken`)
        return 'unknown'
      }
      
      // Bei CORS-Fehlern - auch nicht als broken (Seite existiert wahrscheinlich, nur CORS blockiert)
      if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
        console.log(`[Link-Check] CORS-Fehler bei ${url} - behandle als unknown, nicht als broken`)
        return 'unknown'
      }
      
      // Bei anderen Fehlern - auch nicht als broken
      console.log(`[Link-Check] Fehler bei ${url}: ${errorMessage} - behandle als unknown`)
      return 'unknown'
    }
  } catch (error) {
    // Bei unbekannten Fehlern NICHT als defekt markieren
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log(`[Link-Check] Unbekannter Fehler bei ${url}: ${errorMessage} - behandle als unknown`)
    return 'unknown'
  }
}

/**
 * Normalisiert und filtert Links - gibt null zurück wenn Link ignoriert werden soll
 */
function normalizeAndFilterLink(href: string, baseUrl: string): string | null {
  if (!href || typeof href !== 'string') return null
  
  const trimmed = href.trim()
  
  // Ignoriere leere Links oder nur "#"
  if (!trimmed || trimmed === '#' || trimmed.startsWith('#')) {
    return null
  }
  
  // Ignoriere mailto:, tel:, javascript: Links
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('javascript:')) {
    return null
  }
  
  try {
    // Versuche relative Pfade korrekt aufzulösen
    let absoluteUrl: string
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // Bereits absolute URL
      absoluteUrl = trimmed
    } else {
      // Relative URL - auflösen mit baseUrl
      absoluteUrl = new URL(trimmed, baseUrl).href
    }
    
    // Normalisiere URL (entferne Hash, normalisiere)
    const urlObj = new URL(absoluteUrl)
    urlObj.hash = ''
    
    // Nur HTTP/HTTPS Links prüfen
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return null
    }
    
    // Nur interne Links (gleiche Domain)
    const baseUrlObj = new URL(baseUrl)
    if (urlObj.hostname !== baseUrlObj.hostname) {
      return null
    }
    
    return normalizeUrl(urlObj.href)
  } catch {
    // Ungültige URL - ignorieren
    return null
  }
}

// checkBrokenInternalLinks wird jetzt aus './checks/brokenLinks' importiert

function checkSSL(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const nonHttpsPages = crawlResult.pages.filter((p) => {
    if (!p || !p.url || typeof p.url !== 'string') return false
    try {
      const url = new URL(p.url)
      return url.protocol !== 'https:'
    } catch {
      return false
    }
  })

  if (nonHttpsPages.length === 0) return []

  return [
    {
      id: 'no-ssl',
      category: 'technical',
      title: 'Fehlende SSL-Verschlüsselung',
      description: `${nonHttpsPages.length} Seite${nonHttpsPages.length !== 1 ? 'n' : ''} verwendet${nonHttpsPages.length === 1 ? '' : ''} kein HTTPS. Datenübertragung ist unsicher.`,
      severity: 'high',
      pages: nonHttpsPages.map((p) => p.url),
    },
  ]
}

function checkLoadTime(crawlResult: CrawlResult): CheckResult[] {
  // Note: PerformanceTiming is not available in crawlResult
  // This would need to be tracked during crawling
  // For now, we'll skip this check or implement a placeholder
  return []
}

function checkLargeImages(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const largeImages: Map<string, string[]> = new Map()

  crawlResult.pages.forEach((page) => {
    if (!page || !page.url || !Array.isArray(page.images)) return
    
    page.images.forEach((img) => {
      if (img && typeof img.size === 'number' && img.size > 300 * 1024) {
        // 300KB in bytes
        if (!largeImages.has(page.url)) {
          largeImages.set(page.url, [])
        }
        const imageSrc = img.src || ''
        if (imageSrc) {
          largeImages.get(page.url)!.push(imageSrc)
        }
      }
    })
  })

  if (largeImages.size === 0) return []

  const pages = Array.from(largeImages.keys())
  return [
    {
      id: 'large-images',
      category: 'technical',
      title: 'Zu große Bilder',
      description: `Auf ${pages.length} Seite${pages.length !== 1 ? 'n' : ''} wurden Bilder größer als 300 KB gefunden. Dies verlangsamt die Ladezeit.`,
      severity: 'medium',
      pages,
    },
  ]
}

function checkMissingAltTags(crawlResult: CrawlResult): CheckResult[] {
  // Note: Alt tags are not in crawlResult, would need to be added to crawler
  // For now, we'll skip this check
  return []
}

function checkMissingResponsiveMeta(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutViewport = crawlResult.pages.filter((page) => {
    if (!page || !page.meta || typeof page.meta !== 'object') return true
    const viewport = page.meta['viewport'] || page.meta['Viewport']
    return !viewport || typeof viewport !== 'string' || viewport.trim() === ''
  })

  if (pagesWithoutViewport.length === 0) return []

  return [
    {
      id: 'missing-responsive-meta',
      category: 'technical',
      title: 'Fehlendes Viewport-Meta-Tag',
      description: `${pagesWithoutViewport.length} Seite${pagesWithoutViewport.length !== 1 ? 'n' : ''} hat${pagesWithoutViewport.length === 1 ? '' : ''} kein Viewport-Meta-Tag. Mobile Ansicht ist nicht optimiert.`,
      severity: 'medium',
      pages: pagesWithoutViewport.map((p) => p.url),
    },
  ]
}

function checkConsoleErrors(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithErrors = crawlResult.pages.filter((p) => {
    return p && Array.isArray(p.errors) && p.errors.length > 0
  })

  if (pagesWithErrors.length === 0) return []

  return [
    {
      id: 'console-errors',
      category: 'technical',
      title: 'JavaScript-Fehler',
      description: `${pagesWithErrors.length} Seite${pagesWithErrors.length !== 1 ? 'n' : ''} hat${pagesWithErrors.length === 1 ? '' : ''} JavaScript-Fehler. Funktionalität könnte beeinträchtigt sein.`,
      severity: 'medium',
      pages: pagesWithErrors.map((p) => p.url),
    },
  ]
}

/**
 * Prüft auf sehr große HTML-Dateien (Performance-Indikator)
 * 
 * Sehr große HTML-Dateien (>500KB) können die Ladezeit erheblich beeinträchtigen.
 */
function checkLargeHtmlSize(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const LARGE_HTML_THRESHOLD = 500 * 1024 // 500 KB in bytes
  const pagesWithLargeHtml: string[] = []

  crawlResult.pages.forEach((page) => {
    if (!page || !page.url || !page.html) return
    
    const htmlSize = new Blob([page.html]).size
    if (htmlSize > LARGE_HTML_THRESHOLD) {
      pagesWithLargeHtml.push(page.url)
    }
  })

  if (pagesWithLargeHtml.length === 0) return []

  return [
    {
      id: 'large-html-size',
      category: 'technical',
      title: 'Sehr große HTML-Datei',
      description: `${pagesWithLargeHtml.length} Seite${pagesWithLargeHtml.length !== 1 ? 'n' : ''} hat${pagesWithLargeHtml.length === 1 ? '' : ''} eine HTML-Datei größer als 500 KB. Dies kann die Ladezeit erheblich beeinträchtigen.`,
      severity: 'medium',
      pages: pagesWithLargeHtml,
    },
  ]
}

/**
 * Prüft auf extrem viele externe Skripte (Performance-Indikator)
 * 
 * Eine sehr hohe Anzahl externer Skripte (>15) kann die Ladezeit erheblich beeinträchtigen.
 */
function checkExcessiveScripts(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const EXCESSIVE_SCRIPTS_THRESHOLD = 15 // Mehr als 15 externe Skripte = problematisch
  const pagesWithExcessiveScripts: string[] = []

  crawlResult.pages.forEach((page) => {
    if (!page || !page.url) return
    
    const scriptCount = typeof page.scriptCount === 'number' ? page.scriptCount : 0
    if (scriptCount > EXCESSIVE_SCRIPTS_THRESHOLD) {
      pagesWithExcessiveScripts.push(page.url)
    }
  })

  if (pagesWithExcessiveScripts.length === 0) return []

  return [
    {
      id: 'excessive-scripts',
      category: 'technical',
      title: 'Zu viele externe Skripte',
      description: `${pagesWithExcessiveScripts.length} Seite${pagesWithExcessiveScripts.length !== 1 ? 'n' : ''} lädt${pagesWithExcessiveScripts.length === 1 ? '' : ''} mehr als ${EXCESSIVE_SCRIPTS_THRESHOLD} externe JavaScript-Dateien. Dies kann die Ladezeit erheblich beeinträchtigen.`,
      severity: 'medium',
      pages: pagesWithExcessiveScripts,
    },
  ]
}

// B) SEO Checks

function checkMissingTitle(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutTitle = crawlResult.pages.filter((p) => {
    return !p || !p.title || typeof p.title !== 'string' || p.title.trim() === ''
  })

  if (pagesWithoutTitle.length === 0) return []

  return [
    {
      id: 'missing-title',
      category: 'seo',
      title: 'Fehlender Seitentitel',
      description: `${pagesWithoutTitle.length} Seite${pagesWithoutTitle.length !== 1 ? 'n' : ''} hat${pagesWithoutTitle.length === 1 ? '' : ''} keinen Title-Tag. Wichtig für SEO und Browser-Tabs.`,
      severity: 'high',
      pages: pagesWithoutTitle.map((p) => p.url),
    },
  ]
}

function checkMissingMetaDescription(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutDescription = crawlResult.pages.filter((p) => {
    if (!p || !p.meta || typeof p.meta !== 'object') return true
    const description = p.meta['description'] || p.meta['Description']
    return !description || typeof description !== 'string' || description.trim() === ''
  })

  if (pagesWithoutDescription.length === 0) return []

  return [
    {
      id: 'missing-meta-description',
      category: 'seo',
      title: 'Fehlende Meta-Beschreibung',
      description: `${pagesWithoutDescription.length} Seite${pagesWithoutDescription.length !== 1 ? 'n' : ''} hat${pagesWithoutDescription.length === 1 ? '' : ''} keine Meta-Description. Wird in Suchergebnissen angezeigt.`,
      severity: 'medium',
      pages: pagesWithoutDescription.map((p) => p.url),
    },
  ]
}

function checkMultipleH1(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithMultipleH1 = crawlResult.pages.filter((p) => {
    return p && Array.isArray(p.h1) && p.h1.length > 1
  })

  if (pagesWithMultipleH1.length === 0) return []

  return [
    {
      id: 'multiple-h1',
      category: 'seo',
      title: 'Mehrere H1-Überschriften',
      description: `${pagesWithMultipleH1.length} Seite${pagesWithMultipleH1.length !== 1 ? 'n' : ''} hat${pagesWithMultipleH1.length === 1 ? '' : ''} mehrere H1-Tags. Pro Seite sollte nur eine H1-Überschrift verwendet werden.`,
      severity: 'low',
      pages: pagesWithMultipleH1.map((p) => p.url),
    },
  ]
}

async function checkRobotsTxt(crawlResult: CrawlResult): Promise<CheckResult[]> {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages) || crawlResult.pages.length === 0) return []

  try {
    const firstPage = crawlResult.pages[0]
    if (!firstPage || !firstPage.url || typeof firstPage.url !== 'string') return []
    
    const baseUrl = new URL(firstPage.url)
    const robotsUrl = `${baseUrl.origin}/robots.txt`

    const response = await fetch(robotsUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    if (response.ok) {
      return []
    }
  } catch (error) {
    // robots.txt not found or error - this is expected, so we don't log
    if (error instanceof Error && !error.name.includes('AbortError')) {
      console.debug('Robots.txt check error:', error.message)
    }
  }

  return [
    {
      id: 'no-robots-txt',
      category: 'seo',
      title: 'Fehlende robots.txt',
      description: 'Die Datei robots.txt wurde nicht gefunden. Suchmaschinen können die Website nicht optimal crawlen.',
      severity: 'low',
      pages: [crawlResult.pages[0]?.url || ''],
    },
  ]
}

async function checkSitemapXml(crawlResult: CrawlResult): Promise<CheckResult[]> {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages) || crawlResult.pages.length === 0) return []

  try {
    const firstPage = crawlResult.pages[0]
    if (!firstPage || !firstPage.url || typeof firstPage.url !== 'string') return []
    
    const baseUrl = new URL(firstPage.url)
    const sitemapUrl = `${baseUrl.origin}/sitemap.xml`

    const response = await fetch(sitemapUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    if (response.ok) {
      return []
    }
  } catch (error) {
    // sitemap.xml not found or error - this is expected, so we don't log
    if (error instanceof Error && !error.name.includes('AbortError')) {
      console.debug('Sitemap.xml check error:', error.message)
    }
  }

  return [
    {
      id: 'no-sitemap-xml',
      category: 'seo',
      title: 'Fehlende Sitemap',
      description: 'Die Datei sitemap.xml wurde nicht gefunden. Erleichtert Suchmaschinen die Indexierung Ihrer Seiten.',
      severity: 'low',
      pages: [crawlResult.pages[0]?.url || ''],
    },
  ]
}

// C) Legal Checks

function checkImpressum(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const impressumKeywords = ['impressum', 'imprint', 'legal notice', 'rechtliche hinweise']
  
  // 1. Prüfe in gecrawlten Seiten (URL, Title, Content)
  const hasImpressumInPages = crawlResult.pages.some((page) => {
    if (!page) return false
    const urlLower = (page.url || '').toLowerCase()
    const contentLower = (page.content || '').toLowerCase()
    const titleLower = (page.title || '').toLowerCase()

    return (
      impressumKeywords.some((keyword) => urlLower.includes(keyword)) ||
      impressumKeywords.some((keyword) => contentLower.includes(keyword)) ||
      impressumKeywords.some((keyword) => titleLower.includes(keyword))
    )
  })
  
  // 2. Prüfe auch in Links (falls Impressum-Seite verlinkt, aber nicht gecrawlt wurde)
  const hasImpressumInLinks = crawlResult.pages.some((page) => {
    if (!page || !Array.isArray(page.links)) return false
    
    return page.links.some((link) => {
      if (!link || typeof link !== 'string') return false
      const linkLower = link.toLowerCase()
      return impressumKeywords.some((keyword) => linkLower.includes(keyword))
    })
  })

  if (hasImpressumInPages || hasImpressumInLinks) return []

  return [
    {
      id: 'no-impressum',
      category: 'legal',
      title: 'Fehlendes Impressum',
      description: 'Keine Impressumsseite gefunden. Für deutsche Websites gesetzlich vorgeschrieben.',
      severity: 'high',
      pages: [],
    },
  ]
}

function checkDatenschutz(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const datenschutzKeywords = [
    'datenschutz',
    'privacy',
    'privacy policy',
    'datenschutzerklärung',
    'datenschutz-erklärung',
    'datenschutzerklaerung', // ohne Umlaut
    'dsgvo',
    'gdpr',
  ]
  
  // 1. Prüfe in gecrawlten Seiten (URL, Title, Content)
  const hasDatenschutzInPages = crawlResult.pages.some((page) => {
    if (!page) return false
    const urlLower = (page.url || '').toLowerCase()
    const contentLower = (page.content || '').toLowerCase()
    const titleLower = (page.title || '').toLowerCase()

    return (
      datenschutzKeywords.some((keyword) => urlLower.includes(keyword)) ||
      datenschutzKeywords.some((keyword) => contentLower.includes(keyword)) ||
      datenschutzKeywords.some((keyword) => titleLower.includes(keyword))
    )
  })
  
  // 2. Prüfe auch in Links (falls Datenschutz-Seite verlinkt, aber nicht gecrawlt wurde)
  const hasDatenschutzInLinks = crawlResult.pages.some((page) => {
    if (!page || !Array.isArray(page.links)) return false
    
    return page.links.some((link) => {
      if (!link || typeof link !== 'string') return false
      const linkLower = link.toLowerCase()
      return datenschutzKeywords.some((keyword) => linkLower.includes(keyword))
    })
  })
  
  // 3. Prüfe auch in Meta-Tags (manche Seiten haben Datenschutz-Hinweise in Meta)
  const hasDatenschutzInMeta = crawlResult.pages.some((page) => {
    if (!page || !page.meta) return false
    const metaValues = Object.values(page.meta).join(' ').toLowerCase()
    return datenschutzKeywords.some((keyword) => metaValues.includes(keyword))
  })

  if (hasDatenschutzInPages || hasDatenschutzInLinks || hasDatenschutzInMeta) {
    return []
  }

  return [
    {
      id: 'no-datenschutz',
      category: 'legal',
      title: 'Fehlende Datenschutzerklärung',
      description: 'Keine Datenschutzerklärung gefunden. Erforderlich nach DSGVO bei Datenerhebung.',
      severity: 'high',
      pages: [],
    },
  ]
}

function checkCookieBanner(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const cookieKeywords = ['cookie', 'cookies', 'cookie-banner', 'cookie consent']
  const hasCookieBanner = crawlResult.pages.some((page) => {
    if (!page || !page.content || typeof page.content !== 'string') return false
    const contentLower = page.content.toLowerCase()
    return cookieKeywords.some((keyword) => contentLower.includes(keyword))
  })

  if (hasCookieBanner) return []

  return [
    {
      id: 'no-cookie-banner',
      category: 'legal',
      title: 'Fehlender Cookie-Hinweis',
      description: 'Kein Cookie-Banner gefunden. Bei Verwendung von Cookies ist eine Einwilligung erforderlich.',
      severity: 'medium',
      pages: [],
    },
  ]
}

function checkGoogleFonts(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithGoogleFonts: string[] = []

  crawlResult.pages.forEach((page) => {
    if (!page || !page.url || !Array.isArray(page.links)) return
    
    const hasGoogleFonts =
      page.links.some((link) => link && typeof link === 'string' && link.includes('fonts.googleapis.com')) ||
      page.links.some((link) => link && typeof link === 'string' && link.includes('fonts.gstatic.com'))

    if (hasGoogleFonts) {
      pagesWithGoogleFonts.push(page.url)
    }
  })

  if (pagesWithGoogleFonts.length === 0) return []

  return [
    {
      id: 'google-fonts-remote',
      category: 'legal',
      title: 'Google Fonts von externen Servern',
      description: `${pagesWithGoogleFonts.length} Seite${pagesWithGoogleFonts.length !== 1 ? 'n' : ''} lädt${pagesWithGoogleFonts.length === 1 ? '' : ''} Google Fonts von externen Servern. Kann datenschutzrechtlich problematisch sein.`,
      severity: 'medium',
      pages: pagesWithGoogleFonts,
    },
  ]
}

// D) UX Checks

function checkClickablePhone(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const phonePattern = /(\+?[\d\s\-\(\)]{10,})/g
  const telLinkPattern = /tel:[\d\s\-\(\)\+]+/i

  const pagesWithoutClickablePhone: string[] = []

  crawlResult.pages.forEach((page) => {
    if (!page || !page.url) return
    
    const content = page.content || ''
    const links = Array.isArray(page.links) ? page.links : []
    
    const hasPhone = typeof content === 'string' && phonePattern.test(content)
    const hasTelLink = 
      (typeof content === 'string' && telLinkPattern.test(content)) ||
      links.some((link) => link && typeof link === 'string' && telLinkPattern.test(link))

    if (hasPhone && !hasTelLink) {
      pagesWithoutClickablePhone.push(page.url)
    }
  })

  if (pagesWithoutClickablePhone.length === 0) return []

  return [
    {
      id: 'phone-not-clickable',
      category: 'ux',
      title: 'Telefonnummern nicht klickbar',
      description: `${pagesWithoutClickablePhone.length} Seite${pagesWithoutClickablePhone.length !== 1 ? 'n' : ''} enthält${pagesWithoutClickablePhone.length === 1 ? '' : ''} Telefonnummern, die nicht als Link formatiert sind.`,
      severity: 'low',
      pages: pagesWithoutClickablePhone,
    },
  ]
}

function checkOpeningHours(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const openingHoursKeywords = [
    'öffnungszeiten',
    'opening hours',
    'opening times',
    'business hours',
    'montag',
    'dienstag',
    'monday',
    'tuesday',
  ]
  const hasOpeningHours = crawlResult.pages.some((page) => {
    if (!page || !page.content || typeof page.content !== 'string') return false
    const contentLower = page.content.toLowerCase()
    return openingHoursKeywords.some((keyword) => contentLower.includes(keyword))
  })

  if (hasOpeningHours) return []

  return [
    {
      id: 'no-opening-hours',
      category: 'ux',
      title: 'Keine Öffnungszeiten gefunden',
      description: 'Keine Öffnungszeiten auf der Website gefunden. Wichtig für lokale Unternehmen.',
      severity: 'low',
      pages: [],
    },
  ]
}

function checkCTAButton(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const ctaKeywords = ['jetzt', 'now', 'kaufen', 'buy', 'kontakt', 'contact', 'anfrage', 'request']

  const pagesWithoutCTA: string[] = []

  crawlResult.pages.forEach((page) => {
    if (!page || !page.url) return
    
    const content = page.content || ''
    if (typeof content !== 'string') return
    
    const hasCTAText = ctaKeywords.some((keyword) => content.toLowerCase().includes(keyword))
    // We can't check for actual button elements without DOM access, so we check for CTA text
    // Only flag pages that don't have any CTA-related keywords
    if (!hasCTAText) {
      pagesWithoutCTA.push(page.url)
    }
  })

  // Only report if most pages are missing CTAs (more than 50%)
  if (pagesWithoutCTA.length === 0 || pagesWithoutCTA.length < crawlResult.pages.length * 0.5) {
  return []
}

  return [
    {
      id: 'no-cta-button',
      category: 'ux',
      title: 'Fehlende Call-to-Action',
      description: `${pagesWithoutCTA.length} Seite${pagesWithoutCTA.length !== 1 ? 'n' : ''} hat${pagesWithoutCTA.length === 1 ? '' : ''} möglicherweise keine klaren Handlungsaufforderungen (z.B. "Jetzt kontaktieren").`,
      severity: 'low',
      pages: pagesWithoutCTA,
    },
  ]
}

function checkContactPage(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const contactKeywords = ['kontakt', 'contact', 'get in touch', 'reach us']
  const hasContactPage = crawlResult.pages.some((page) => {
    if (!page) return false
    const urlLower = (page.url || '').toLowerCase()
    const titleLower = (page.title || '').toLowerCase()
    const contentLower = (page.content || '').toLowerCase()

    return (
      contactKeywords.some((keyword) => urlLower.includes(keyword)) ||
      contactKeywords.some((keyword) => titleLower.includes(keyword)) ||
      contactKeywords.some((keyword) => contentLower.includes(keyword))
    )
  })

  if (hasContactPage) return []

  return [
    {
      id: 'no-contact-page',
      category: 'ux',
      title: 'Keine Kontaktseite gefunden',
      description: 'Keine dedizierte Kontaktseite gefunden. Kunden sollten einfach Kontakt aufnehmen können.',
      severity: 'medium',
      pages: [],
    },
  ]
}

function checkGoogleMaps(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const hasGoogleMaps = crawlResult.pages.some((page) => {
    if (!page) return false
    
    const links = Array.isArray(page.links) ? page.links : []
    const content = page.content || ''
    const images = Array.isArray(page.images) ? page.images : []
    
    return (
      links.some((link) => link && typeof link === 'string' && (link.includes('maps.google.com') || link.includes('google.com/maps'))) ||
      (typeof content === 'string' && content.toLowerCase().includes('google maps')) ||
      images.some((img) => img && img.src && typeof img.src === 'string' && img.src.includes('maps.googleapis.com'))
    )
  })

  if (hasGoogleMaps) return []

  return [
    {
      id: 'no-google-maps',
      category: 'ux',
      title: 'Keine Google Maps Integration',
      description: 'Keine Google Maps Einbindung gefunden. Hilfreich für lokale Unternehmen zur Standortanzeige.',
      severity: 'low',
      pages: [],
    },
  ]
}

// 1) Canonical-Tag-Check (SEO)
function checkCanonicalTag(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages) || crawlResult.pages.length === 0) return []
  
  // Finde die Startseite (erste Seite oder Seite mit depth 0)
  const startPage = crawlResult.pages[0]
  if (!startPage || !startPage.url) return []
  
  // Prüfe ob canonical vorhanden ist
  const hasCanonical = startPage.canonical && typeof startPage.canonical === 'string' && startPage.canonical.trim() !== ''
  
  if (hasCanonical && startPage.canonical) {
    // Optional: Prüfe ob canonical auf andere Domain zeigt
    try {
      const canonicalUrl = new URL(startPage.canonical)
      const pageUrl = new URL(startPage.url)
      
      if (canonicalUrl.hostname !== pageUrl.hostname) {
        return [
          {
            id: 'seo_missing_canonical',
            category: 'seo',
            title: 'Canonical-Tag zeigt auf andere Domain',
            description: `Das Canonical-Tag zeigt auf eine andere Domain (${canonicalUrl.hostname}). Canonicals sollten auf die eigene Domain verweisen.`,
            severity: 'medium',
            pages: [startPage.url],
          },
        ]
      }
    } catch {
      // Invalid canonical URL - wird als fehlend behandelt
    }
    
    return []
  }
  
  return [
    {
      id: 'seo_missing_canonical',
      category: 'seo',
      title: 'Canonical-Tag fehlt',
      description: 'Es wurde kein Canonical-Tag auf der Startseite gefunden. Canonicals helfen Suchmaschinen, die Hauptversion einer Seite zu erkennen.',
      severity: 'medium',
      pages: [startPage.url],
    },
  ]
}

// 2) Open-Graph-Tags-Check (SEO)
function checkOpenGraphTags(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages) || crawlResult.pages.length === 0) return []
  
  const startPage = crawlResult.pages[0]
  if (!startPage || !startPage.url || !startPage.meta || typeof startPage.meta !== 'object') return []
  
  const meta = startPage.meta
  const hasOgTitle = meta['og:title'] && typeof meta['og:title'] === 'string' && meta['og:title'].trim() !== ''
  const hasOgDescription = meta['og:description'] && typeof meta['og:description'] === 'string' && meta['og:description'].trim() !== ''
  const hasOgImage = meta['og:image'] && typeof meta['og:image'] === 'string' && meta['og:image'].trim() !== ''
  
  if (hasOgTitle && hasOgDescription && hasOgImage) {
    return []
  }
  
  return [
    {
      id: 'seo_missing_og_tags',
      category: 'seo',
      title: 'Fehlende Open-Graph-Tags',
      description: 'Es fehlen Open-Graph-Meta-Tags (og:title, og:description oder og:image). Diese verbessern die Darstellung Ihrer Website in Social Media und Messengern.',
      severity: 'low',
      pages: [startPage.url],
    },
  ]
}

// 3) HTML lang-Attribut (SEO/Accessibility)
function checkHtmlLangAttribute(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages) || crawlResult.pages.length === 0) return []
  
  const startPage = crawlResult.pages[0]
  if (!startPage || !startPage.url) return []
  
  const htmlLang = startPage.htmlLang
  const hasLang = htmlLang && typeof htmlLang === 'string' && htmlLang.trim() !== ''
  
  if (hasLang) {
    return []
  }
  
  return [
    {
      id: 'seo_missing_lang_attr',
      category: 'seo',
      title: 'Fehlendes Sprachattribut',
      description: 'Das lang-Attribut im <html>-Tag fehlt oder ist leer. Suchmaschinen und Screenreader nutzen dieses Attribut, um die Sprache der Seite zu erkennen.',
      severity: 'low',
      pages: [startPage.url],
    },
  ]
}

// 4) Call-to-Action-Check (UX/Conversion)
function checkPrimaryCTA(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages) || crawlResult.pages.length === 0) return []
  
  const startPage = crawlResult.pages[0]
  if (!startPage || !startPage.url) return []
  
  const content = startPage.content || ''
  const links = Array.isArray(startPage.links) ? startPage.links : []
  
  if (typeof content !== 'string') return []
  
  const contentLower = content.toLowerCase()
  const linksText = links.join(' ').toLowerCase()
  const combinedText = contentLower + ' ' + linksText
  
  // CTA-Phrasen
  const ctaPhrases = [
    'kontakt',
    'jetzt anfragen',
    'angebot anfordern',
    'termin vereinbaren',
    'jetzt buchen',
    'jetzt bestellen',
    'jetzt kaufen',
    'anfrage stellen',
    'beratung anfordern',
    'kostenlos anfragen',
    'jetzt kontaktieren',
    'get in touch',
    'contact us',
    'book now',
    'order now',
  ]
  
  const hasCTA = ctaPhrases.some((phrase) => combinedText.includes(phrase.toLowerCase()))
  
  if (hasCTA) {
  return []
  }
  
  return [
    {
      id: 'ux_missing_primary_cta',
      category: 'ux',
      title: 'Kein klarer Call-to-Action',
      description: "Auf der Startseite wurde kein klarer Handlungsaufruf (z. B. 'Kontakt', 'Jetzt anfragen', 'Termin vereinbaren') gefunden. Besucher wissen so oft nicht, was sie als nächstes tun sollen.",
      severity: 'medium',
      pages: [startPage.url],
    },
  ]
}

// 5) Favicon-Check (UX/Branding)
function checkFavicon(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages) || crawlResult.pages.length === 0) return []
  
  const startPage = crawlResult.pages[0]
  if (!startPage || !startPage.url) return []
  
  const hasFavicon = startPage.hasFavicon === true
  
  if (hasFavicon) {
    return []
  }
  
  return [
    {
      id: 'ux_missing_favicon',
      category: 'ux',
      title: 'Kein Favicon definiert',
      description: 'Es wurde kein Favicon gefunden. Ein Favicon verbessert die Wiedererkennbarkeit in Browser-Tabs und Lesezeichen.',
      severity: 'low',
      pages: [startPage.url],
    },
  ]
}

/**
 * Prüft auf veraltetes Design basierend auf HTML/CSS-Mustern
 * 
 * Analysiert Indikatoren für veraltete Gestaltung:
 * - <font>-Tags, <center>-Tags
 * - Viele Inline-Styles statt CSS-Klassen
 * - Tabellen-Layout (nicht für Daten)
 * - Fehlende moderne Layout-Techniken (flex/grid)
 * - Fehlende Viewport-Meta-Tags
 * - Feste Pixelbreiten
 * - Veraltete HTML-Attribute
 * 
 * Gibt einen Score von 0-100 zurück (100 = sehr modern, 0 = extrem veraltet)
 */
function calculateOutdatedDesignScore(html: string | undefined, meta: Record<string, string> | undefined): number {
  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    // Kein HTML verfügbar = neutral bewerten
    return 70
  }

  const htmlLower = html.toLowerCase()
  let score = 80 // Startwert (konservativ, nicht perfekt)

  // 1. <font>-Tags (veraltet, HTML5 entfernt)
  const fontTagMatches = (htmlLower.match(/<font[^>]*>/gi) || []).length
  if (fontTagMatches > 0) {
    score -= 20
  }

  // 2. <center>-Tags (veraltet, CSS sollte verwendet werden)
  const centerTagMatches = (htmlLower.match(/<center[^>]*>/gi) || []).length
  if (centerTagMatches > 0) {
    score -= 20
  }

  // 3. Inline-Styles (viele deuten auf veraltetes Design hin)
  // Zähle style-Attribute und vergleiche mit Gesamtzahl der Elemente
  const styleAttributeMatches = (htmlLower.match(/style\s*=\s*["'][^"']*["']/gi) || []).length
  const elementMatches = (htmlLower.match(/<[^/>]+>/gi) || []).length
  if (elementMatches > 0) {
    const inlineStyleRatio = styleAttributeMatches / elementMatches
    // Wenn mehr als 10% der Elemente Inline-Styles haben = veraltetes Pattern
    if (inlineStyleRatio > 0.1) {
      score -= 15
    } else if (inlineStyleRatio > 0.05) {
      score -= 8
    }
  }

  // 4. Tabellen-Layout (Tabellen ohne semantische Daten)
  // Prüfe auf Tabellen mit Layout-Attributen (width, align, bgcolor) oder in Layout-Kontexten
  const tableMatches = (htmlLower.match(/<table[^>]*>/gi) || []).length
  if (tableMatches > 0) {
    // Prüfe ob Tabellen Layout-Attribute haben (nicht nur für Daten)
    const layoutTableMatches = (htmlLower.match(/<table[^>]*(?:width|align|bgcolor|cellpadding|cellspacing|border\s*=\s*["']0["'])[^>]*>/gi) || []).length
    if (layoutTableMatches > 0) {
      score -= 20
    } else if (tableMatches > 2) {
      // Viele Tabellen könnten für Layout verwendet werden
      score -= 10
    }
  }

  // 5. Veraltete HTML-Attribute
  const bgcolorMatches = (htmlLower.match(/bgcolor\s*=\s*["'][^"']*["']/gi) || []).length
  if (bgcolorMatches > 0) {
    score -= 10
  }

  const borderZeroMatches = (htmlLower.match(/border\s*=\s*["']0["']/gi) || []).length
  if (borderZeroMatches > 3) {
    // Mehrere border="0" deuten auf Layout-Tabellen hin
    score -= 10
  }

  // 6. Moderne Layout-Techniken (flex/grid) im CSS prüfen
  const hasFlex = htmlLower.includes('display:') && (
    htmlLower.includes('display:flex') || 
    htmlLower.includes('display: flex') ||
    htmlLower.includes('display:-webkit-flex')
  )
  const hasGrid = htmlLower.includes('display:') && (
    htmlLower.includes('display:grid') || 
    htmlLower.includes('display: grid')
  )
  if (!hasFlex && !hasGrid && elementMatches > 20) {
    // Viele Elemente aber keine modernen Layout-Techniken = veraltet
    score -= 15
  }

  // 7. Viewport-Meta-Tag (bereits separat geprüft, aber hier nochmal zur Sicherheit)
  const hasViewport = meta && (
    meta['viewport'] || 
    meta['Viewport'] ||
    (htmlLower.includes('<meta') && htmlLower.includes('viewport'))
  )
  if (!hasViewport) {
    score -= 20
  }

  // 8. Feste Pixelbreiten (veraltetes Layout-Pattern)
  // Prüfe auf width-Attribute mit niedrigen Pixelwerten (<1000px)
  const fixedWidthMatches = (htmlLower.match(/width\s*=\s*["'](\d{1,3})["']/gi) || [])
  if (fixedWidthMatches.length > 2) {
    // Mehrere feste Breiten unter 1000px deuten auf veraltetes Design
    score -= 10
  }

  // Stelle sicher, dass Score im Bereich 0-100 bleibt
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Check für veraltetes Design
 * 
 * Analysiert HTML-Quellcode auf veraltete Design-Patterns und erzeugt Issues
 * wenn der Outdated-Design-Score unter einem Schwellenwert liegt.
 */
function checkOutdatedDesign(crawlResult: CrawlResult): CheckResult[] {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages) || crawlResult.pages.length === 0) return []
  
  const startPage = crawlResult.pages[0]
  if (!startPage || !startPage.url) return []

  // Berechne Outdated-Design-Score
  const designScore = calculateOutdatedDesignScore(startPage.html, startPage.meta)

  // Wenn Score unter Schwellenwert (< 50) = Issue erstellen
  if (designScore < 50) {
    if (!startPage.html) {
      // HTML nicht verfügbar = kein detailliertes Issue
      return []
    }

    const htmlLower = startPage.html.toLowerCase()
    const issues: string[] = []

    // Sammle konkrete Probleme für die Beschreibung
    if (htmlLower.includes('<font')) {
      issues.push('veraltete <font>-Tags')
    }
    if (htmlLower.includes('<center')) {
      issues.push('veraltete <center>-Tags für Layout')
    }
    const styleMatches = (startPage.html.match(/style\s*=\s*["'][^"']*["']/gi) || []).length
    const elementMatches = (startPage.html.match(/<[^/>]+>/gi) || []).length
    if (elementMatches > 0) {
      const styleRatio = styleMatches / elementMatches
      if (styleRatio > 0.1) {
        issues.push('viele Inline-Styles statt CSS-Klassen')
      }
    }
    if (htmlLower.includes('<table') && (htmlLower.match(/<table[^>]*(?:width|align|bgcolor|cellpadding|cellspacing|border\s*=\s*["']0["'])[^>]*>/gi) || []).length > 0) {
      issues.push('Tabellen-Layout statt moderner CSS-Layouts')
    }
    if (!startPage.meta?.viewport && !htmlLower.includes('viewport')) {
      issues.push('fehlende mobile Optimierung (viewport-Meta-Tag)')
    }

    const issueDetails = issues.length > 0 
      ? ` Konkrete Probleme: ${issues.join(', ')}.`
      : ''

    // Bestimme Severity basierend auf Score
    let severity: 'low' | 'medium' | 'high' = 'medium'
    if (designScore < 30) {
      severity = 'high'
    } else if (designScore >= 40) {
      severity = 'low'
    }

    return [
      {
        id: 'ux_outdated_design',
        category: 'ux',
        title: 'Veraltete Gestaltung',
        description: `Die Website verwendet veraltete Layout-Techniken (Design-Score: ${designScore}/100).${issueDetails} Eine Modernisierung kann die Nutzerfreundlichkeit deutlich verbessern und die Website auf allen Geräten besser darstellbar machen.`,
        severity,
        pages: [startPage.url],
      },
    ]
  }

  return []
}

