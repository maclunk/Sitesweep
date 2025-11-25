/**
 * Modulare Crawl-Engine für robustes Website-Crawling
 * 
 * Features:
 * - URL-Normalisierung mit Tracking-Parameter-Entfernung
 * - Redirect-Handling (301/302/307/308)
 * - robots.txt Respekt
 * - Timeout + Retry mit exponential backoff
 * - Concurrency-Limits
 * - Crawl-Budget (maxPages, maxDepth)
 * - Content-Type-Schutz
 * - SPA-Erkennung
 */

// Optional puppeteer import (for local development only)
let puppeteer: any
try {
  const puppeteerModule = require('puppeteer')
  puppeteer = puppeteerModule.default || puppeteerModule
} catch {
  // Puppeteer not available (expected in Vercel deployment)
}

type Browser = any
type Page = any
import {
  normalizeUrl,
  removeTrackingParams,
  resolveRelativeUrl,
  normalizeForComparison,
  sameBaseDomain,
  validateUrl,
  getContentTypeFromExtension,
} from '../utils/url'

// Konfiguration
const CONFIG = {
  MAX_CRAWL_TIME: 3 * 60 * 1000, // 3 Minuten
  PAGE_TIMEOUT: 10000, // 10 Sekunden pro Request
  MAX_RETRIES: 2,
  RETRY_DELAY_BASE: 1000, // Exponential backoff base
  MAX_REDIRECTS: 5,
  MAX_PAGES: 25, // Erhöht für Launch-Level
  MAX_DEPTH: 2,
  MAX_CONCURRENT: 4, // Parallele Requests
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SiteSweep/1.0',
}

export interface PageData {
  url: string
  finalUrl: string // URL nach allen Redirects
  statusCode: number
  title: string
  metaDescription?: string
  meta: Record<string, string>
  h1Count: number
  h2Count: number
  h1: string[]
  h2: string[]
  textSnippet: string
  wordCount: number
  internalLinks: string[]
  externalLinks: string[]
  assets: {
    css: string[]
    js: string[]
    images: { src: string; size: number }[]
  }
  loadErrors: string[]
  timings: {
    ttfb?: number // Time to First Byte
    total?: number // Total load time
  }
  canonical?: string
  htmlLang?: string
  hasFavicon: boolean
  html?: string
  scriptCount: number
  isSPA?: boolean // Single Page Application
  robotsDisallowed?: boolean
  redirects: string[] // Chain der Redirects
}

export interface CrawlEngineResult {
  pages: PageData[]
  robotsTxtLoaded: boolean
  robotsTxtRules?: {
    disallowed: string[]
    allowed: string[]
  }
  crawlStats: {
    totalPages: number
    successfulPages: number
    errorPages: number
    totalTime: number
  }
}

interface RobotsTxtRule {
  disallowed: string[]
  allowed: string[]
}

interface CrawlQueueItem {
  url: string
  depth: number
}

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
          'User-Agent': CONFIG.USER_AGENT,
        },
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok || response.status >= 400) {
        return null
      }
      
      const text = await response.text()
      return parseRobotsTxt(text)
    } catch {
      clearTimeout(timeoutId)
      return null
    }
  } catch {
    return null
  }
}

/**
 * Parst robots.txt
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
    if (line.startsWith('#')) continue
    
    const lowerLine = line.toLowerCase()
    
    if (lowerLine.startsWith('user-agent:')) {
      currentUserAgent = line.substring(11).trim()
      inUserAgentSection = currentUserAgent === '*' || currentUserAgent.toLowerCase().includes('sitesweep')
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
    
    for (const disallowPath of robotsRule.disallowed) {
      if (disallowPath === '/') {
        // Disallow / bedeutet alles blockiert, außer es gibt Allow-Regeln
        const hasAllow = robotsRule.allowed.some(allowPath => path.startsWith(allowPath))
        if (!hasAllow) return true
      } else if (path.startsWith(disallowPath)) {
        // Prüfe ob es eine spezifischere Allow-Regel gibt
        const hasMoreSpecificAllow = robotsRule.allowed.some(
          allowPath => path.startsWith(allowPath) && allowPath.length > disallowPath.length
        )
        if (!hasMoreSpecificAllow) return true
      }
    }
    
    return false
  } catch {
    return false
  }
}

/**
 * Crawlt eine einzelne Seite mit Retry-Logik
 */
async function crawlPage(
  browser: Browser,
  url: string,
  baseUrl: string,
  robotsRule: RobotsTxtRule | null
): Promise<PageData | null> {
  let retries = 0
  let lastError: Error | null = null
  
  while (retries <= CONFIG.MAX_RETRIES) {
    let page: Page | null = null
    
    try {
      page = await browser.newPage()
      
      // Set User-Agent
      await page.setUserAgent(CONFIG.USER_AGENT)
      page.setDefaultNavigationTimeout(CONFIG.PAGE_TIMEOUT)
      page.setDefaultTimeout(CONFIG.PAGE_TIMEOUT)
      
      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      })
      
      // Resource interception
      await page.setRequestInterception(true)
      page.on('request', (request: any) => {
        const requestUrl = request.url()
        const resourceType = request.resourceType()
        
        // Nur HTML für Crawling, Assets für Analyse
        if (resourceType === 'document' || resourceType === 'stylesheet' || 
            resourceType === 'script' || resourceType === 'image' || resourceType === 'font') {
          request.continue()
        } else {
          request.abort()
        }
      })
      
      // Track redirects
      const redirects: string[] = [url]
      page.on('request', (request: any) => {
        if (request.redirectChain().length > 0) {
          redirects.push(...request.redirectChain().map((r: any) => r.url()))
        }
      })
      
      const loadErrors: string[] = []
      const startTime = Date.now()
      
      // Console errors
      page.on('console', (msg: any) => {
        if (msg.type() === 'error') {
          const text = msg.text()
          if (text && !text.includes('favicon') && !text.includes('ERR_')) {
            loadErrors.push(text)
          }
        }
      })
      
      // Navigate
      let response = null
      try {
        response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: CONFIG.PAGE_TIMEOUT,
        })
      } catch (navError) {
        if (navError instanceof Error) {
          lastError = navError
        }
        throw navError
      }
      
      const finalUrl = page.url()
      const statusCode = response?.status() || 0
      const ttfb = Date.now() - startTime
      
      // Handle HTTP errors
      if (statusCode >= 400) {
        await page.close()
        return {
          url,
          finalUrl,
          statusCode,
          title: '',
          meta: {},
          h1Count: 0,
          h2Count: 0,
          h1: [],
          h2: [],
          textSnippet: '',
          wordCount: 0,
          internalLinks: [],
          externalLinks: [],
          assets: { css: [], js: [], images: [] },
          loadErrors: [`HTTP ${statusCode} error`],
          timings: { ttfb },
          hasFavicon: false,
          scriptCount: 0,
          redirects,
        }
      }
      
      // Check Content-Type
      const contentType = response?.headers()['content-type'] || ''
      if (!contentType.includes('text/html')) {
        await page.close()
        return null // Nicht HTML, skip
      }
      
      // Extract page data
      const pageData = await page.evaluate(() => {
        const title = document.title || ''
        
        const meta: Record<string, string> = {}
        document.querySelectorAll('meta').forEach((tag) => {
          const name = tag.getAttribute('name') || tag.getAttribute('property') || tag.getAttribute('itemprop')
          const content = tag.getAttribute('content')
          if (name && content) {
            meta[name] = content
          }
        })
        
        const h1Elements = document.querySelectorAll('h1')
        const h1 = Array.from(h1Elements).map(el => el.textContent?.trim() || '').filter(Boolean)
        
        const h2Elements = document.querySelectorAll('h2')
        const h2 = Array.from(h2Elements).map(el => el.textContent?.trim() || '').filter(Boolean)
        
        const body = document.body
        const textContent = body ? body.innerText || body.textContent || '' : ''
        const words = textContent.split(/\s+/).filter(w => w.length > 0)
        const wordCount = words.length
        const textSnippet = words.slice(0, 200).join(' ') // Erste 200 Wörter
        
        const allLinks: string[] = []
        const internalLinks: string[] = []
        const externalLinks: string[] = []
        const baseHostname = window.location.hostname
        
        document.querySelectorAll('a[href]').forEach((el) => {
          const href = el.getAttribute('href')
          if (!href) return
          
          try {
            const absoluteUrl = new URL(href, window.location.href).href
            allLinks.push(absoluteUrl)
            
            try {
              const linkUrl = new URL(absoluteUrl)
              if (linkUrl.hostname === baseHostname || linkUrl.hostname === `www.${baseHostname}` || baseHostname === `www.${linkUrl.hostname}`) {
                internalLinks.push(absoluteUrl)
              } else {
                externalLinks.push(absoluteUrl)
              }
            } catch {
              // Ignore invalid URLs
            }
          } catch {
            // Ignore invalid URLs
          }
        })
        
        const cssLinks: string[] = []
        document.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
          const href = el.getAttribute('href')
          if (href) {
            try {
              cssLinks.push(new URL(href, window.location.href).href)
            } catch {}
          }
        })
        
        const jsLinks: string[] = []
        document.querySelectorAll('script[src]').forEach((el) => {
          const src = el.getAttribute('src')
          if (src) {
            try {
              jsLinks.push(new URL(src, window.location.href).href)
            } catch {}
          }
        })
        
        const images: { src: string }[] = []
        document.querySelectorAll('img[src]').forEach((el) => {
          const src = el.getAttribute('src')
          if (src) {
            try {
              images.push({ src: new URL(src, window.location.href).href })
            } catch {}
          }
        })
        
        const canonicalLink = document.querySelector('link[rel="canonical"]')
        const canonical = canonicalLink ? canonicalLink.getAttribute('href') : null
        
        const htmlLang = document.documentElement.getAttribute('lang') || null
        
        const hasFavicon = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').length > 0
        
        const html = document.documentElement.outerHTML || ''
        
        // SPA-Erkennung: wenig Text, viele JS-Bundles
        const isSPA = wordCount < 100 && jsLinks.length > 5
        
        return {
          title,
          meta,
          h1,
          h2,
          textSnippet,
          wordCount,
          internalLinks,
          externalLinks,
          cssLinks,
          jsLinks,
          images,
          canonical,
          htmlLang,
          hasFavicon,
          html,
          scriptCount: jsLinks.length,
          isSPA,
        }
      })
      
      const totalTime = Date.now() - startTime
      
      // Resolve canonical if relative
      let canonicalUrl: string | undefined
      if (pageData.canonical) {
        canonicalUrl = resolveRelativeUrl(pageData.canonical, finalUrl) || pageData.canonical
      }
      
      await page.close()
      
      return {
        url,
        finalUrl,
        statusCode,
        title: pageData.title,
        metaDescription: pageData.meta.description,
        meta: pageData.meta,
        h1Count: pageData.h1.length,
        h2Count: pageData.h2.length,
        h1: pageData.h1,
        h2: pageData.h2,
        textSnippet: pageData.textSnippet,
        wordCount: pageData.wordCount,
        internalLinks: pageData.internalLinks,
        externalLinks: pageData.externalLinks,
        assets: {
          css: pageData.cssLinks,
          js: pageData.jsLinks,
          images: pageData.images.map((img: any) => ({ ...img, size: 0 })), // Size wird später gefüllt
        },
        loadErrors,
        timings: {
          ttfb,
          total: totalTime,
        },
        canonical: canonicalUrl,
        htmlLang: pageData.htmlLang || undefined,
        hasFavicon: pageData.hasFavicon,
        html: pageData.html,
        scriptCount: pageData.scriptCount,
        isSPA: pageData.isSPA,
        robotsDisallowed: isDisallowedByRobots(finalUrl, robotsRule),
        redirects,
      }
    } catch (error) {
      if (page) {
        try {
          await page.close()
        } catch {}
      }
      
      lastError = error instanceof Error ? error : new Error(String(error))
      retries++
      
      if (retries <= CONFIG.MAX_RETRIES) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, CONFIG.RETRY_DELAY_BASE * Math.pow(2, retries - 1))
        )
        continue
      }
      
      // Max retries reached
      return {
        url,
        finalUrl: url,
        statusCode: 0,
        title: '',
        meta: {},
        h1Count: 0,
        h2Count: 0,
        h1: [],
        h2: [],
        textSnippet: '',
        wordCount: 0,
        internalLinks: [],
        externalLinks: [],
        assets: { css: [], js: [], images: [] },
        loadErrors: [lastError.message],
        timings: {},
        hasFavicon: false,
        scriptCount: 0,
        redirects: [url],
      }
    }
  }
  
  return null
}

/**
 * Hauptfunktion: Crawlt eine Website
 */
export async function crawlWebsite(url: string): Promise<CrawlEngineResult> {
  const startTime = Date.now()
  const normalizedUrl = normalizeUrl(removeTrackingParams(url))
  
  if (!validateUrl(normalizedUrl)) {
    throw new Error(`Invalid URL: ${url}`)
  }
  
  // Lade robots.txt
  const robotsRule = await loadRobotsTxt(normalizedUrl)
  const robotsTxtLoaded = robotsRule !== null
  
  // Prüfe ob Start-URL blockiert ist
  if (isDisallowedByRobots(normalizedUrl, robotsRule)) {
    return {
      pages: [],
      robotsTxtLoaded,
      robotsTxtRules: robotsRule || undefined,
      crawlStats: {
        totalPages: 0,
        successfulPages: 0,
        errorPages: 0,
        totalTime: Date.now() - startTime,
      },
    }
  }
  
  const pages: PageData[] = []
  const visited = new Set<string>()
  const queue: CrawlQueueItem[] = [{ url: normalizedUrl, depth: 0 }]
  let browser: Browser | null = null
  
  try {
    // Check if puppeteer is available
    if (!puppeteer) {
      throw new Error('Crawler engine is not available. Puppeteer has been removed for Vercel compatibility.')
    }

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
    
    // Concurrency-Limiter: Processe bis zu CONFIG.MAX_CONCURRENT Pages parallel
    const processing = new Set<Promise<void>>()
    
    while ((queue.length > 0 || processing.size > 0) && pages.length < CONFIG.MAX_PAGES) {
      // Check timeout
      if (Date.now() - startTime > CONFIG.MAX_CRAWL_TIME) {
        break
      }
      
      // Starte neue Crawls wenn Platz vorhanden
      while (processing.size < CONFIG.MAX_CONCURRENT && queue.length > 0 && pages.length < CONFIG.MAX_PAGES) {
        const { url: currentUrl, depth } = queue.shift()!
        const normalizedCurrent = normalizeForComparison(currentUrl)
        
        if (visited.has(normalizedCurrent) || depth > CONFIG.MAX_DEPTH) {
          continue
        }
        
        // Prüfe robots.txt
        if (isDisallowedByRobots(currentUrl, robotsRule)) {
          visited.add(normalizedCurrent)
          continue
        }
        
        // Prüfe Content-Type
        const contentType = getContentTypeFromExtension(currentUrl)
        if (contentType !== 'html') {
          visited.add(normalizedCurrent)
          continue
        }
        
        visited.add(normalizedCurrent)
        
        // Starte Crawl
        const crawlTask = async () => {
          try {
            const pageData = await crawlPage(browser!, currentUrl, normalizedUrl, robotsRule)
            if (pageData) {
              pages.push(pageData)
              
              // Füge neue Links zur Queue hinzu
              if (depth < CONFIG.MAX_DEPTH) {
                for (const link of pageData.internalLinks) {
                  const normalizedLink = normalizeUrl(removeTrackingParams(link))
                  const normalizedForCompare = normalizeForComparison(normalizedLink)
                  
                  if (
                    !visited.has(normalizedForCompare) &&
                    !queue.some(q => normalizeForComparison(q.url) === normalizedForCompare) &&
                    sameBaseDomain(normalizedLink, normalizedUrl) &&
                    getContentTypeFromExtension(normalizedLink) === 'html' &&
                    !isDisallowedByRobots(normalizedLink, robotsRule)
                  ) {
                    queue.push({ url: normalizedLink, depth: depth + 1 })
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error crawling ${currentUrl}:`, error)
          } finally {
            processing.delete(crawlPromise)
          }
        }
        const crawlPromise = crawlTask()
        processing.add(crawlPromise)
      }
      
      // Warte auf einen der laufenden Crawls
      if (processing.size > 0) {
        await Promise.race(Array.from(processing))
      } else {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    // Warte auf alle verbleibenden Crawls
    if (processing.size > 0) {
      await Promise.all(Array.from(processing))
    }
  } finally {
    if (browser) {
      await browser.close()
    }
  }
  
  const successfulPages = pages.filter(p => p.statusCode >= 200 && p.statusCode < 400).length
  const errorPages = pages.length - successfulPages
  
  return {
    pages,
    robotsTxtLoaded,
    robotsTxtRules: robotsRule || undefined,
    crawlStats: {
      totalPages: pages.length,
      successfulPages,
      errorPages,
      totalTime: Date.now() - startTime,
    },
  }
}

