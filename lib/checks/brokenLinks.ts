/**
 * Verbesserter Broken-Link-Check mit reduzierten False Positives
 */

import { CrawlResult } from '../checks'
import { normalizeUrl, normalizeForComparison } from '../utils/url'

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

interface LinkResult {
  broken: string[]
  blocked: string[] // 403/401
  redirected: string[] // Redirects die funktionieren
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SiteSweep/1.0'

/**
 * Prüft einen einzelnen Link mit verbesserter Logik
 */
async function checkLink(url: string): Promise<'ok' | 'broken' | 'blocked' | 'redirected' | 'unknown'> {
  try {
    // Versuche erst HEAD, dann GET mit Range
    let response: Response | null = null
    
    // Methode 1: HEAD-Request
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })
      
      clearTimeout(timeoutId)
    } catch (headError) {
      // HEAD fehlgeschlagen, versuche GET mit Range
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          redirect: 'follow',
          headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Range': 'bytes=0-0', // Nur erste Bytes
          },
        })
        
        clearTimeout(timeoutId)
      } catch {
        return 'unknown'
      }
    }
    
    if (!response) return 'unknown'
    
    const status = response.status
    const finalUrl = response.url
    
    // 2xx und 3xx = OK
    if (status >= 200 && status < 400) {
      // Prüfe ob Redirect
      if (finalUrl !== url && (status === 301 || status === 302 || status === 307 || status === 308)) {
        return 'redirected'
      }
      return 'ok'
    }
    
    // 404 und 410 = wirklich broken
    if (status === 404 || status === 410) {
      // Zusätzliche Validierung: Prüfe ob final URL eine Error-Seite ist
      if (finalUrl !== url) {
        const finalUrlLower = finalUrl.toLowerCase()
        const isErrorPage = finalUrlLower.includes('404') || 
                           finalUrlLower.includes('error') || 
                           finalUrlLower.includes('not-found') ||
                           finalUrlLower.includes('page-not-found')
        
        if (!isErrorPage) {
          // Redirect zu einer anderen Seite - wahrscheinlich OK
          return 'redirected'
        }
      }
      
      return 'broken'
    }
    
    // 401/403 = blocked, NICHT als broken
    if (status === 401 || status === 403) {
      return 'blocked'
    }
    
    // 5xx = Serverfehler, NICHT als broken
    if (status >= 500) {
      return 'unknown' // Serverfehler, nicht als broken werten
    }
    
    // Andere 4xx = nicht als broken
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Verbesserter Broken-Link-Check
 */
export async function checkBrokenInternalLinks(crawlResult: CrawlResult): Promise<CheckResult[]> {
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  // Finde Basis-URL
  const baseUrl = crawlResult.pages[0]?.url
  if (!baseUrl) return []
  
  try {
    const baseUrlObj = new URL(baseUrl)
    
    // Sammle gecrawlte Seiten
    const crawledPages = new Set<string>()
    crawlResult.pages.forEach(page => {
      if (page?.url) {
        crawledPages.add(normalizeForComparison(page.url))
      }
    })
    
    // Sammle interne Links
    const linksToCheck = new Map<string, Set<string>>() // link -> pages mit diesem Link
    
    crawlResult.pages.forEach(page => {
      if (!page?.url || !page.links) return
      
      page.links.forEach((link: any) => {
        try {
          const linkUrl = new URL(link, page.url)
          
          // Nur interne Links
          if (linkUrl.hostname !== baseUrlObj.hostname && 
              linkUrl.hostname !== `www.${baseUrlObj.hostname}` &&
              baseUrlObj.hostname !== `www.${linkUrl.hostname}`) {
            return
          }
          
          // Ignoriere bereits gecrawlte Seiten
          const normalizedLink = normalizeForComparison(linkUrl.href)
          if (crawledPages.has(normalizedLink)) {
            return
          }
          
          // Sammle Link
          const absoluteUrl = normalizeUrl(linkUrl.href)
          if (!linksToCheck.has(absoluteUrl)) {
            linksToCheck.set(absoluteUrl, new Set())
          }
          linksToCheck.get(absoluteUrl)!.add(page.url)
        } catch {
          // Ungültige URL
        }
      })
    })
    
    if (linksToCheck.size === 0) return []
    
    // Prüfe maximal 15 Links (für Performance)
    const linksArray = Array.from(linksToCheck.entries()).slice(0, 15)
    const linkResults: LinkResult = {
      broken: [],
      blocked: [],
      redirected: [],
    }
    const linkToPagesMap = new Map<string, Set<string>>()
    
    // Prüfe in Batches (3 parallel)
    const batchSize = 3
    for (let i = 0; i < linksArray.length; i += batchSize) {
      const batch = linksArray.slice(i, i + batchSize)
      
      await Promise.all(batch.map(async ([link, pages]) => {
        const result = await checkLink(link)
        
        if (result === 'broken') {
          linkResults.broken.push(link)
          linkToPagesMap.set(link, pages)
        } else if (result === 'blocked') {
          linkResults.blocked.push(link)
        } else if (result === 'redirected') {
          linkResults.redirected.push(link)
        }
      }))
      
      // Kurze Pause zwischen Batches
      if (i + batchSize < linksArray.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    const results: CheckResult[] = []
    
    // Broken Links
    if (linkResults.broken.length > 0) {
      const pagesWithBroken = new Set<string>()
      linkResults.broken.forEach(link => {
        const pages = linkToPagesMap.get(link)
        if (pages) {
          pages.forEach(page => pagesWithBroken.add(page))
        }
      })
      
      results.push({
        id: 'technical-broken-links',
        category: 'technical',
        title: `${linkResults.broken.length} defekte interne Link(s) gefunden`,
        description: `Diese Links verweisen auf nicht existierende Seiten (404/410): ${linkResults.broken.slice(0, 3).join(', ')}${linkResults.broken.length > 3 ? '...' : ''}`,
        severity: 'medium',
        pages: Array.from(pagesWithBroken),
        evidence: `${linkResults.broken.length} Links mit HTTP 404/410`,
        recommendation: 'Prüfen Sie die Links und entfernen oder korrigieren Sie fehlerhafte Verweise.',
        categoryScoreRaw: Math.max(0, 100 - (linkResults.broken.length * 8)),
        metadata: {
          brokenLinks: linkResults.broken,
          blockedLinks: linkResults.blocked,
          redirectedLinks: linkResults.redirected,
        },
      })
    }
    
    return results
  } catch (error) {
    console.error('[BrokenLinks] Error checking links:', error)
    return []
  }
}

