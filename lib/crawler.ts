import { normalizeUrl, sameDomain } from './utils'
import { SAFE_MODE } from './config'

// Optional puppeteer import (for local development only)
let puppeteer: any
try {
  const puppeteerModule = require('puppeteer')
  puppeteer = puppeteerModule.default || puppeteerModule
} catch {
  // Puppeteer not available (expected in Vercel deployment)
}

type Browser = any

export interface CrawlResult {
  pages: Array<{
    url: string // Original/Normalisierte URL
    finalUrl?: string // Finale URL nach Redirects
    status: number // HTTP Status Code
    title: string
    meta: Record<string, string>
    metaDescription?: string
    h1: string[]
    h2Count?: number
    h1Count?: number
    links: string[]
    internalLinks?: string[]
    externalLinks?: string[]
    images: { src: string; size: number }[]
    assets?: {
      css: string[]
      js: string[]
      images: string[]
      fonts: string[]
    }
    content: string
    textSnippet?: string // Erste ~500 Zeichen für Preview
    wordCount?: number
    html?: string // Vollständiger HTML-Quellcode für Design-Analyse
    scriptCount?: number // Anzahl externer Script-Tags (Performance-Indikator)
    errors: string[]
    loadErrors?: string[] // Separate Errors für Assets
    canonical?: string | null
    htmlLang?: string | null
    hasFavicon?: boolean
    timings?: {
      ttfb?: number // Time to First Byte
      total?: number // Total Load Time
    }
    isSPA?: boolean // Single Page Application erkannt
    contentType?: string // Content-Type Header
    redirectChain?: string[] // Chain von Redirects
  }>
  robotsTxt?: {
    exists: boolean
    disallowedPaths: string[]
    allowedPaths: string[]
    crawled?: boolean
  }
  crawlMetadata?: {
    totalPages: number
    totalSize: number
    crawlTime: number
    errors: string[]
  }
}

interface CrawlPage {
  url: string
  depth: number
}

interface RobotsTxtRule {
  disallowed: string[]
  allowed: string[]
}

// Performance: Reduzierte Limits für schnellere, stabilere Scans
const MAX_CRAWL_TIME = 3 * 60 * 1000 // 3 minutes max (reduziert von 5)
const PAGE_TIMEOUT = 15000 // 15 seconds per page (erhöht für robustere Requests)
const MAX_RETRIES = 2
const MAX_REDIRECTS = 5 // Maximale Anzahl an Weiterleitungen pro Request
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SiteSweep/1.0' // Realistischer User-Agent
const MAX_PAGES = 25 // Erhöht für MVP - mehr Seiten für umfassendere Analyse
const MAX_TOTAL_SIZE = 20 * 1024 * 1024 // 20 MB
const MAX_DEPTH = 2 // Erhöht - Startseite + 2 Ebenen für bessere Coverage
const MAX_CONCURRENT_PAGES = 4 // Maximal 4 parallele Fetches für Concurrency-Limit

/**
 * Crawl-Strategie:
 * - Tiefe: Maximal 1 Ebene (Startseite + direkte Links)
 * - Seiten: Maximal 5 Seiten insgesamt
 * - Timeout: 15 Sekunden pro Seite
 * - Weiterleitungen: Automatisch bis zu 5x
 * - Ziel: Fokussierte Analyse der wichtigsten Seiten statt umfangreiches Crawling
 */

// Dateitypen, die ignoriert werden sollen
const IGNORED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.zip', '.rar', '.tar', '.gz', '.exe', '.dmg']

/**
 * Lädt und parst robots.txt
 */
async function loadRobotsTxt(baseUrl: string): Promise<RobotsTxtRule | null> {
  try {
    const url = new URL(baseUrl)
    const robotsUrl = `${url.origin}/robots.txt`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    try {
      const response = await fetch(robotsUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
        },
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok || response.status >= 400) {
        return null
      }
      
      const text = await response.text()
      return parseRobotsTxt(text)
    } catch (error) {
      clearTimeout(timeoutId)
      // robots.txt nicht verfügbar - das ist OK
      return null
    }
  } catch {
    return null
  }
}

/**
 * Parst robots.txt und gibt Regeln für User-agent: * zurück
 */
function parseRobotsTxt(content: string): RobotsTxtRule {
  const rule: RobotsTxtRule = {
    disallowed: [],
    allowed: [],
  }
  
  const lines = content.split('\n').map(line => line.trim())
  let inUserAgentSection = false
  let currentUserAgent = ''
  
  for (const line of lines) {
    if (line.startsWith('#')) continue // Kommentar
    
    const lowerLine = line.toLowerCase()
    
    if (lowerLine.startsWith('user-agent:')) {
      currentUserAgent = line.substring(11).trim()
      inUserAgentSection = currentUserAgent === '*' || currentUserAgent === USER_AGENT
    } else if (inUserAgentSection) {
      if (lowerLine.startsWith('disallow:')) {
        const path = line.substring(9).trim()
        if (path) {
          rule.disallowed.push(path)
        }
      } else if (lowerLine.startsWith('allow:')) {
        const path = line.substring(6).trim()
        if (path) {
          rule.allowed.push(path)
        }
      }
    }
  }
  
  return rule
}

/**
 * Prüft, ob eine URL von robots.txt blockiert wird
 */
function isDisallowedByRobots(url: string, robotsRule: RobotsTxtRule | null): boolean {
  if (!robotsRule || robotsRule.disallowed.length === 0) {
    return false
  }
  
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    
    // Prüfe alle Disallow-Regeln
    for (const disallowPath of robotsRule.disallowed) {
      if (disallowPath === '/') {
        // Disallow / bedeutet alles blockiert
        // Prüfe ob es eine Allow-Regel gibt
        const hasAllow = robotsRule.allowed.some(allowPath => {
          if (path.startsWith(allowPath)) return true
          return false
        })
        if (!hasAllow) return true
      } else if (path.startsWith(disallowPath)) {
        // Prüfe ob es eine spezifischere Allow-Regel gibt
        const hasMoreSpecificAllow = robotsRule.allowed.some(allowPath => {
          return path.startsWith(allowPath) && allowPath.length > disallowPath.length
        })
        if (!hasMoreSpecificAllow) return true
      }
    }
    
    return false
  } catch {
    return false
  }
}

/**
 * Prüft, ob eine URL eine ignorierte Dateiendung hat
 */
function hasIgnoredExtension(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    return IGNORED_EXTENSIONS.some(ext => pathname.endsWith(ext))
  } catch {
    return false
  }
}

/**
 * Prüft, ob ein Content-Type gültig ist (HTML, CSS, JS, Image, Font)
 */
function isValidContentType(contentType: string): boolean {
  const type = contentType.toLowerCase().split(';')[0].trim()
  const validTypes = [
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/x-javascript',
    'image/',
    'font/',
    'application/font-',
  ]
  return validTypes.some(validType => type.includes(validType))
}

/**
 * Normalisiert URL für Vergleich (ohne Query und Hash)
 */
function normalizeForComparison(url: string): string {
  try {
    const urlObj = new URL(url)
    urlObj.search = ''
    urlObj.hash = ''
    return normalizeUrl(urlObj.href)
  } catch {
    return normalizeUrl(url)
  }
}

/**
 * Extrahiert die Domain ohne Subdomain
 */
function getBaseDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    const parts = hostname.split('.')
    if (parts.length >= 2) {
      // Nimm die letzten 2 Teile (z.B. example.com)
      return parts.slice(-2).join('.')
    }
    return hostname
  } catch {
    return null
  }
}

/**
 * Prüft, ob zwei URLs zur gleichen Base-Domain gehören
 */
function sameBaseDomain(url1: string, url2: string): boolean {
  const base1 = getBaseDomain(url1)
  const base2 = getBaseDomain(url2)
  return base1 !== null && base2 !== null && base1 === base2
}

export async function crawl(url: string): Promise<CrawlResult> {
  const normalizedUrl = normalizeUrl(url)
  
  // SAFE MODE: Schnelle Dummy-Analyse ohne Playwright
  if (SAFE_MODE) {
    console.log('[Crawler] SAFE_MODE active - returning dummy data for', normalizedUrl)
    
    return {
      pages: [
        {
          url: normalizedUrl,
          status: 200,
          title: 'SAFE MODE Dummy',
          meta: {
            description: 'Dummy meta description for safe mode',
          },
          h1: ['Dummy H1 Heading'],
          links: [],
          images: [],
          content: 'Dummy content for safe mode analysis',
          html: '<html><head><title>Test</title></head><body>Test</body></html>',
          scriptCount: 0,
          errors: [],
          canonical: null,
          htmlLang: 'de',
          hasFavicon: false,
        },
      ],
    }
  }
  
  // Vollständiger Crawl mit Playwright (nur wenn SAFE_MODE = false)
  const startTime = Date.now()
  const pages: CrawlResult['pages'] = []
  const visited = new Set<string>()
  const queue: CrawlPage[] = [{ url: normalizedUrl, depth: 0 }]
  const resourceSizes = new Map<string, number>()
  let totalSize = 0
  const maxDepth = MAX_DEPTH // Verwendet Konstante aus Config

  // Lade robots.txt vor dem Crawl
  let robotsRule: RobotsTxtRule | null = null
  try {
    robotsRule = await loadRobotsTxt(normalizedUrl)
  } catch (error) {
    console.debug('Could not load robots.txt:', error)
  }

  // Prüfe ob Start-URL von robots.txt blockiert wird
  if (isDisallowedByRobots(normalizedUrl, robotsRule)) {
    return {
      pages: [
        {
          url: normalizedUrl,
          status: 0,
          title: '',
          meta: {},
          h1: [],
          links: [],
          images: [],
          content: '',
          errors: ['robots_disallowed: URL is disallowed by robots.txt'],
          canonical: null,
          htmlLang: null,
          hasFavicon: false,
        },
      ],
    }
  }

  // Check if puppeteer is available
  if (!puppeteer) {
    throw new Error('Crawler is not available. Puppeteer has been removed for Vercel compatibility. Use SCANNER_API_URL for scanning.')
  }

  let browser: Browser | null = null

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      timeout: 60000,
    })

    // Concurrency-Limit: Queue-System für parallele Fetches
    const activeCrawls = new Set<Promise<void>>()

    async function crawlPage({ url: currentUrl, depth }: CrawlPage): Promise<void> {
      // Normalisiere für Vergleich (ohne Query/Hash)
      const normalizedCurrent = normalizeForComparison(currentUrl)

      // Skip if already visited or too deep
      if (visited.has(normalizedCurrent) || depth > maxDepth) {
        return
      }

      // Prüfe robots.txt
      if (isDisallowedByRobots(currentUrl, robotsRule)) {
        pages.push({
          url: currentUrl,
          status: 0,
          title: '',
          meta: {},
          h1: [],
          links: [],
          images: [],
          content: '',
          errors: ['robots_disallowed'],
        })
        visited.add(normalizedCurrent)
        return
      }

      // Prüfe auf ignorierte Dateitypen
      if (hasIgnoredExtension(currentUrl)) {
        visited.add(normalizedCurrent)
        return
      }

      visited.add(normalizedCurrent)

      let retries = 0
      let success = false

      while (retries <= MAX_RETRIES && !success) {
        if (!browser) {
          throw new Error('Browser not initialized')
        }
        let page = null
        try {
          page = await browser.newPage()
          
          // Set User-Agent (realistischer Browser-User-Agent)
          await page.setUserAgent(USER_AGENT)
          
          // Set timeouts (15 Sekunden für robustere Requests)
          page.setDefaultNavigationTimeout(PAGE_TIMEOUT)
          page.setDefaultTimeout(PAGE_TIMEOUT)
          
          // Konfiguriere automatische Weiterleitungen (bis zu MAX_REDIRECTS)
          await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
          })

          // Resource interception - nur HTML, CSS, JS, IMG, Fonts
          await page.setRequestInterception(true)
          page.on('request', (request: any) => {
            const requestUrl = request.url()
            
            // Ignoriere externe Domains
            if (!sameBaseDomain(requestUrl, normalizedUrl)) {
              request.abort()
              return
            }
            
            // Content-Type-Schutz: Prüfe URL und Resource-Type
            if (hasIgnoredExtension(requestUrl)) {
              request.abort()
              return
            }
            
            const resourceType = request.resourceType()
            
            // Allow only essential resource types
            if (
              resourceType === 'document' || // HTML
              resourceType === 'stylesheet' || // CSS
              resourceType === 'script' || // JS
              resourceType === 'image' || // IMG
              resourceType === 'font' // Fonts for CSS
            ) {
              request.continue()
            } else {
              request.abort()
            }
          })

          const consoleErrors: string[] = []

          // Track console errors - only critical ones
          page.on('console', (msg: any) => {
            if (msg.type() === 'error') {
              const text = msg.text()
              // Filter out common non-critical errors
              if (
                text &&
                !text.includes('favicon') &&
                !text.includes('404') &&
                !text.includes('Failed to load resource') &&
                !text.includes('net::ERR_')
              ) {
                consoleErrors.push(text)
              }
            }
          })

          // Track resource sizes
          page.on('response', async (response: any) => {
            try {
              const responseUrl = response.url()
              
              // Nur interne Ressourcen tracken
              if (!sameBaseDomain(responseUrl, normalizedUrl)) {
                return
              }
              
              // Content-Type-Schutz: Prüfe Content-Type Header
              const contentType = response.headers()['content-type'] || ''
              if (contentType && !isValidContentType(contentType)) {
                // Kein HTML/CSS/JS/Image/Font - als Asset erfassen aber nicht laden
                return
              }
              
              const resourceType = response.request().resourceType()
              const contentLength = response.headers()['content-length']
              
              if (contentLength) {
                const size = parseInt(contentLength, 10)
                if (!isNaN(size) && size > 0) {
                  resourceSizes.set(responseUrl, size)
                  totalSize += size
                }
              }
            } catch (err) {
              // Ignore response tracking errors
            }
          })

          // Handle request failures
          page.on('requestfailed', (request: any) => {
            if (request.resourceType() === 'document') {
              const failure = request.failure()
              if (failure && failure.errorText) {
                if (failure.errorText.includes('net::ERR') || failure.errorText.includes('timeout')) {
                  consoleErrors.push(`Request failed: ${failure.errorText}`)
                }
              }
            }
          })

          // Track timings
          const timingsStart = Date.now()
          let ttfb: number | undefined

          // Track TTFB from response
          page.on('response', (response: any) => {
            if (response.request().resourceType() === 'document' && !ttfb) {
              ttfb = Date.now() - timingsStart
            }
          })

          // Navigate to page with timeout und automatischer Weiterleitung
          let response = null
          let finalUrl = currentUrl
          
          try {
            response = await Promise.race([
              page.goto(currentUrl, {
                waitUntil: 'domcontentloaded',
                timeout: PAGE_TIMEOUT,
              }),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Navigation timeout')), PAGE_TIMEOUT)
              ),
            ]) as any
            
            // Hole finale URL nach Weiterleitungen
            finalUrl = page.url()
            
          } catch (navError) {
            // Verbesserte Fehlerbehandlung: Unterscheidung zwischen Netzwerk-, DNS- und HTTP-Fehlern
            let errorType = 'unknown'
            let errorMessage = 'Navigation failed'
            
            if (navError instanceof Error) {
              errorMessage = navError.message
              
              // DNS-Fehler (Host nicht erreichbar)
              if (
                errorMessage.includes('net::ERR_NAME_NOT_RESOLVED') ||
                errorMessage.includes('DNS_PROBE_FINISHED_NXDOMAIN') ||
                errorMessage.includes('Name resolution failed')
              ) {
                errorType = 'dns'
                errorMessage = 'Host nicht erreichbar (DNS-Fehler)'
              }
              // Netzwerk-Fehler (Verbindungsprobleme)
              else if (
                errorMessage.includes('net::ERR_CONNECTION_REFUSED') ||
                errorMessage.includes('net::ERR_CONNECTION_TIMED_OUT') ||
                errorMessage.includes('net::ERR_CONNECTION_CLOSED') ||
                errorMessage.includes('timeout') ||
                errorMessage.includes('Navigation timeout')
              ) {
                errorType = 'network'
                if (errorMessage.includes('timeout')) {
                  errorMessage = 'Seite nicht erreichbar (Timeout nach 15 Sekunden)'
                } else {
                  errorMessage = 'Netzwerkfehler (Verbindung verweigert)'
                }
              }
              // SSL/TLS-Fehler
              else if (
                errorMessage.includes('net::ERR_CERT') ||
                errorMessage.includes('SSL') ||
                errorMessage.includes('TLS')
              ) {
                errorType = 'ssl'
                errorMessage = 'SSL/TLS-Fehler (Zertifikat ungültig)'
              }
              // Andere Netzwerk-Fehler
              else if (errorMessage.includes('net::ERR')) {
                errorType = 'network'
                errorMessage = `Netzwerkfehler: ${errorMessage}`
              }
            }
            
            consoleErrors.push(errorMessage)
            
            // Bei Fehler: Seite mit differenziertem Fehler hinzufügen und weiter
            pages.push({
              url: currentUrl,
              status: 0,
              title: '',
              meta: {},
              h1: [],
              links: [],
              images: [],
              content: '',
              html: undefined,
              scriptCount: 0,
              errors: consoleErrors.length > 0 ? consoleErrors : [errorMessage],
              canonical: null,
              htmlLang: null,
              hasFavicon: false,
            })
            
            await page.close()
            success = true // Markiere als "erledigt" (auch wenn fehlgeschlagen)
            continue
          }

          const status = response?.status() || 0

          // Verwende finale URL nach Weiterleitungen
          const actualUrl = finalUrl || currentUrl

          // Handle HTTP errors (4xx, 5xx) mit differenzierten Fehlermeldungen
          if (status >= 400) {
            if (status === 429) {
              consoleErrors.push('Rate limit (429) - too many requests')
              // Wait before retry
              if (retries < MAX_RETRIES) {
                await page.close()
                await new Promise((resolve) => setTimeout(resolve, 2000 * (retries + 1)))
                retries++
                continue
              }
            }
            
            // Differenzierte Fehlermeldungen für verschiedene HTTP-Status-Codes
            let errorMessage = `HTTP ${status} error`
            if (status === 404) {
              errorMessage = 'Seite nicht gefunden (404)'
            } else if (status === 403) {
              errorMessage = 'Zugriff verweigert (403)'
            } else if (status === 500) {
              errorMessage = 'Serverfehler (500)'
            } else if (status >= 500) {
              errorMessage = `Serverfehler (${status})`
            } else if (status >= 400) {
              errorMessage = `Client-Fehler (${status})`
            }
            
            // Bei 404/500/etc: Seite mit differenziertem Fehler hinzufügen und weiter
            pages.push({
              url: actualUrl, // Verwende finale URL
              status,
              title: '',
              meta: {},
              h1: [],
              links: [],
              images: [],
              content: '',
              html: undefined,
              scriptCount: 0,
              errors: [errorMessage],
              canonical: null,
              htmlLang: null,
              hasFavicon: false,
            })
            
            await page.close()
            success = true // Markiere als "erledigt"
            continue
          }

          // Extract page data
          const pageData = await page.evaluate(() => {
            const baseUrl = window.location.origin

            // Extract title
            const title = document.title || ''

            // Extract meta tags
            const meta: Record<string, string> = {}
            let metaDescription = ''
            const metaTags = document.querySelectorAll('meta')
            metaTags.forEach((tag) => {
              const name = tag.getAttribute('name') || tag.getAttribute('property') || tag.getAttribute('itemprop')
              const content = tag.getAttribute('content') || ''
              if (name && content) {
                meta[name.toLowerCase()] = content
                if (name.toLowerCase() === 'description') {
                  metaDescription = content
                }
              }
            })

            // Extract h1 and h2 tags
            const h1Elements = document.querySelectorAll('h1')
            const h1: string[] = Array.from(h1Elements).map((el) => el.textContent?.trim() || '').filter(Boolean)
            const h1Count = h1.length
            const h2Elements = document.querySelectorAll('h2')
            const h2Count = h2Elements.length

            // Extract links and separate internal/external
            const linkElements = document.querySelectorAll('a[href]')
            const allLinks: string[] = []
            const internalLinks: string[] = []
            const externalLinks: string[] = []
            
            linkElements.forEach((el) => {
              const href = el.getAttribute('href')
              if (!href || href.startsWith('#') || href.startsWith('javascript:')) return
              
              try {
                const resolvedUrl = new URL(href, window.location.href).href
                allLinks.push(resolvedUrl)
                
                try {
                  const linkUrl = new URL(resolvedUrl)
                  const isInternal = linkUrl.origin === baseUrl
                  if (isInternal) {
                    internalLinks.push(resolvedUrl)
                  } else {
                    externalLinks.push(resolvedUrl)
                  }
                } catch {
                  // Ignore URL parsing errors
                }
              } catch {
                // Ignore invalid URLs
              }
            })

            // Extract assets (CSS, JS, Images, Fonts)
            const assets = {
              css: [] as string[],
              js: [] as string[],
              images: [] as string[],
              fonts: [] as string[],
            }

            // CSS
            const cssLinks = document.querySelectorAll('link[rel="stylesheet"]')
            cssLinks.forEach((link) => {
              const href = link.getAttribute('href')
              if (href) {
                try {
                  assets.css.push(new URL(href, window.location.href).href)
                } catch {}
              }
            })

            // JS
            const jsScripts = document.querySelectorAll('script[src]')
            jsScripts.forEach((script) => {
              const src = script.getAttribute('src')
              if (src) {
                try {
                  assets.js.push(new URL(src, window.location.href).href)
                } catch {}
              }
            })

            // Images
            const imageElements = document.querySelectorAll('img[src]')
            const images: { src: string; size: number }[] = Array.from(imageElements)
              .map((el) => {
                const src = el.getAttribute('src')
                if (!src) return null
                try {
                  const fullUrl = new URL(src, window.location.href).href
                  assets.images.push(fullUrl)
                  return { src: fullUrl, size: 0 } // Size will be filled from resource tracking
                } catch {
                  return null
                }
              })
              .filter((img): img is { src: string; size: number } => img !== null)

            // Fonts (from CSS @font-face, approximated by link[rel="preload"] or stylesheets)
            const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"], link[href*="font"]')
            fontLinks.forEach((link) => {
              const href = link.getAttribute('href')
              if (href) {
                try {
                  const fontUrl = new URL(href, window.location.href).href
                  if (!assets.fonts.includes(fontUrl)) {
                    assets.fonts.push(fontUrl)
                  }
                } catch {}
              }
            })

            // Extract content (text content of body)
            const body = document.body
            const content = body ? body.innerText || body.textContent || '' : ''
            const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
            const textSnippet = content.substring(0, 500).trim()

            // Extract HTML source code for design analysis
            const html = document.documentElement.outerHTML || ''

            // Count script tags (Performance-Indikator)
            const scriptElements = document.querySelectorAll('script[src]')
            const scriptCount = scriptElements.length

            // Detect SPA: wenig Text, viele JS-Bundles
            const isSPA = wordCount < 100 && scriptCount > 3 && html.length < 10000

            // Extract canonical link
            const canonicalLink = document.querySelector('link[rel="canonical"]')
            const canonical = canonicalLink ? canonicalLink.getAttribute('href') : null

            // Extract HTML lang attribute
            const htmlElement = document.documentElement
            const htmlLang = htmlElement.getAttribute('lang') || null

            // Check for favicon
            const faviconLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
            const hasFavicon = faviconLinks.length > 0

            return {
              title,
              meta,
              metaDescription,
              h1,
              h1Count,
              h2Count,
              links: allLinks,
              internalLinks,
              externalLinks,
              images,
              assets,
              content,
              textSnippet,
              wordCount,
              html,
              scriptCount,
              canonical,
              htmlLang,
              hasFavicon,
              isSPA,
            }
          })

          const timingsTotal = Date.now() - timingsStart

          // Update image sizes from tracked resources
          const imagesWithSizes = pageData.images.map((img: any) => ({
            ...img,
            size: resourceSizes.get(img.src) || 0,
          }))

          // Resolve canonical URL if relative
          let canonicalUrl: string | null = null
          if (pageData.canonical) {
            try {
              canonicalUrl = new URL(pageData.canonical, actualUrl).href
            } catch {
              canonicalUrl = pageData.canonical
            }
          }

          // Get Content-Type from response
          const contentType = response?.headers()?.['content-type'] || 'text/html'

          // Build redirect chain (simplified - Puppeteer follows redirects automatically)
          const redirectChain: string[] = []
          if (currentUrl !== actualUrl) {
            redirectChain.push(currentUrl)
            redirectChain.push(actualUrl)
          }

          // Track load errors separately
          const loadErrors: string[] = []
          // Add console errors that are resource-related to loadErrors
          consoleErrors.forEach(err => {
            if (err.includes('Failed to load resource') || err.includes('net::ERR')) {
              loadErrors.push(err)
            }
          })

          // Add page to results (verwende finale URL nach Weiterleitungen)
          pages.push({
            url: currentUrl, // Original URL
            finalUrl: actualUrl, // Final URL nach Redirects
            status,
            title: pageData.title,
            meta: pageData.meta,
            metaDescription: pageData.metaDescription,
            h1: pageData.h1,
            h1Count: pageData.h1Count,
            h2Count: pageData.h2Count,
            links: pageData.links,
            internalLinks: pageData.internalLinks,
            externalLinks: pageData.externalLinks,
            images: imagesWithSizes,
            assets: pageData.assets,
            content: pageData.content,
            textSnippet: pageData.textSnippet,
            wordCount: pageData.wordCount,
            html: pageData.html,
            scriptCount: pageData.scriptCount,
            errors: consoleErrors.filter(err => !err.includes('Failed to load resource') && !err.includes('net::ERR')),
            loadErrors: loadErrors.length > 0 ? loadErrors : undefined,
            canonical: canonicalUrl,
            htmlLang: pageData.htmlLang,
            hasFavicon: pageData.hasFavicon,
            timings: {
              ttfb: ttfb,
              total: timingsTotal,
            },
            isSPA: pageData.isSPA,
            contentType,
            redirectChain: redirectChain.length > 0 ? redirectChain : undefined,
          })

          // Add new links to queue (only same base domain, not visited, not ignored)
          if (depth < maxDepth) {
            for (const link of pageData.links) {
              // Normalisiere Link
              const normalizedLink = normalizeUrl(link)
              
              // Prüfe auf ignorierte Dateitypen
              if (hasIgnoredExtension(normalizedLink)) {
                continue
              }
              
              // Prüfe robots.txt
              if (isDisallowedByRobots(normalizedLink, robotsRule)) {
                continue
              }
              
              // Prüfe auf gleiche Base-Domain (ohne Subdomain)
              if (!sameBaseDomain(normalizedLink, normalizedUrl)) {
                continue
              }
              
              // Normalisiere für Vergleich
              const normalizedForCompare = normalizeForComparison(normalizedLink)
              
              // Prüfe ob bereits besucht oder in Queue
              if (
                !visited.has(normalizedForCompare) &&
                !queue.some((q) => normalizeForComparison(q.url) === normalizedForCompare)
              ) {
                queue.push({ url: normalizedLink, depth: depth + 1 })
              }
            }
          }

          await page.close()
          success = true
        } catch (error) {
          if (page) {
            try {
              await page.close()
            } catch {
              // Ignore close errors
            }
          }

          retries++
          if (retries > MAX_RETRIES) {
            // Max retries reached, add error page
            pages.push({
              url: currentUrl,
              status: 0,
              title: '',
              meta: {},
              h1: [],
              links: [],
              images: [],
              content: '',
              html: undefined,
              scriptCount: 0,
              errors: [
                error instanceof Error
                  ? error.message
                  : typeof error === 'string'
                  ? error
                  : 'Unknown error',
              ],
              canonical: null,
              htmlLang: null,
              hasFavicon: false,
            })
            success = true // Markiere als "erledigt" auch bei Fehler
          } else {
            // Wait before retry with exponential backoff
            await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
          }
        }
      }
    }

    // Queue-Loop mit Concurrency-Limit
    while ((queue.length > 0 || activeCrawls.size > 0) && pages.length < MAX_PAGES) {
      // Check max crawl time
      if (Date.now() - startTime > MAX_CRAWL_TIME) {
        break
      }

      // Check total size limit
      if (totalSize > MAX_TOTAL_SIZE) {
        break
      }

      // Starte neue Crawls bis Concurrency-Limit erreicht ist
      while (activeCrawls.size < MAX_CONCURRENT_PAGES && queue.length > 0 && pages.length < MAX_PAGES) {
        const { url: currentUrl, depth } = queue.shift()!
        const crawlPromise = crawlPage({ url: currentUrl, depth })
        activeCrawls.add(crawlPromise)
        
        crawlPromise.finally(() => {
          activeCrawls.delete(crawlPromise)
        })
      }

      // Warte kurz, bevor wir neue Crawls starten
      if (activeCrawls.size >= MAX_CONCURRENT_PAGES || queue.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    // Warte auf alle aktiven Crawls
    await Promise.all(Array.from(activeCrawls))
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  const crawlTime = Date.now() - startTime

  // Build robots.txt metadata
  const robotsMetadata = robotsRule
    ? {
        exists: true,
        disallowedPaths: robotsRule.disallowed,
        allowedPaths: robotsRule.allowed,
        crawled: true,
      }
    : {
        exists: false,
        disallowedPaths: [],
        allowedPaths: [],
        crawled: false,
      }

  return {
    pages,
    robotsTxt: robotsMetadata,
    crawlMetadata: {
      totalPages: pages.length,
      totalSize,
      crawlTime,
      errors: [],
    },
  }
}
