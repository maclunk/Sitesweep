/**
 * Legal Checks - Rechtliche Prüfungen
 */

import { CrawlResult } from '../checks'
import { normalizeUrl } from '../utils/url'

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
 * Impressum-Check-Keywords
 */
const IMPRINT_KEYWORDS = [
  'impressum',
  'imprint',
  'imprint legal notice',
  'legal notice',
  'anbieterkennzeichnung',
  'angaben gemäß',
  'verantwortlich',
  'haftungshinweis',
  'datenschutz',
  'haftungsausschluss',
]

/**
 * Datenschutz-Check-Keywords
 */
const PRIVACY_KEYWORDS = [
  'datenschutz',
  'privacy',
  'datenschutzerklärung',
  'privacy policy',
  'datenschutzhinweis',
  'cookie',
  'dsgvo',
  'gdpr',
]

/**
 * Prüft auf Impressum
 */
export function checkImpressum(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  
  if (!crawlResult?.pages || crawlResult.pages.length === 0) return []
  
  // Prüfe jede Seite auf Impressum-Keywords
  const pagesWithoutImpressum: string[] = []
  const baseUrl = crawlResult.pages[0]?.url
  
  if (!baseUrl) return []
  
  try {
    const baseUrlObj = new URL(baseUrl)
    
    // 1. Prüfe ob es einen expliziten Impressum-Link gibt
    let hasImpressumLink = false
    let impressumUrl: string | null = null
    
    crawlResult.pages.forEach(page => {
      // Prüfe Links
      const links = page.links || []
      for (const link of links) {
        try {
          const linkUrl = new URL(link)
          const pathname = linkUrl.pathname.toLowerCase()
          const hostname = linkUrl.hostname
          
          // Muss gleiche Domain sein
          if (hostname !== baseUrlObj.hostname && hostname !== `www.${baseUrlObj.hostname}` && baseUrlObj.hostname !== `www.${hostname}`) {
            continue
          }
          
          // Prüfe auf Impressum-Keywords im Pfad oder Titel
          if (pathname.includes('impressum') || pathname.includes('imprint') || pathname.includes('legal')) {
            hasImpressumLink = true
            impressumUrl = link
            break
          }
        } catch {
          continue
        }
      }
      
      // Prüfe auch Seiteninhalt auf Impressum-Keywords
      if (!hasImpressumLink) {
        const content = (page.content || '').toLowerCase()
        const title = (page.title || '').toLowerCase()
        const url = (page.url || '').toLowerCase()
        
        const hasKeyword = IMPRINT_KEYWORDS.some(keyword => 
          content.includes(keyword) || title.includes(keyword) || url.includes(keyword)
        )
        
        if (hasKeyword) {
          hasImpressumLink = true
          impressumUrl = page.url
        }
      }
    })
    
    if (!hasImpressumLink) {
      pagesWithoutImpressum.push(baseUrl)
    }
  } catch {
    // Bei Fehlern keine Prüfung
  }
  
  if (pagesWithoutImpressum.length > 0) {
    results.push({
      id: 'legal-missing-impressum',
      category: 'legal',
      title: 'Impressum nicht gefunden',
      description: 'Auf der Website wurde kein Impressum gefunden. Dies ist für kommerzielle Websites in Deutschland rechtlich erforderlich (TMG/Impressumspflicht).',
      severity: 'high',
      pages: pagesWithoutImpressum,
      evidence: 'Kein Impressum-Link oder -Inhalt gefunden',
      recommendation: 'Erstellen Sie ein Impressum gemäß TMG §5 und verlinken Sie es im Footer Ihrer Website.',
      categoryScoreRaw: 0, // Kritisch
    })
  }
  
  return results
}

/**
 * Prüft auf Datenschutzerklärung
 */
export function checkPrivacyPolicy(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  
  if (!crawlResult?.pages || crawlResult.pages.length === 0) return []
  
  const pagesWithoutPrivacy: string[] = []
  const baseUrl = crawlResult.pages[0]?.url
  
  if (!baseUrl) return []
  
  try {
    const baseUrlObj = new URL(baseUrl)
    
    // Prüfe ob es einen Datenschutz-Link gibt
    let hasPrivacyLink = false
    
    crawlResult.pages.forEach(page => {
      // Prüfe Links
      const links = page.links || []
      for (const link of links) {
        try {
          const linkUrl = new URL(link)
          const pathname = linkUrl.pathname.toLowerCase()
          const hostname = linkUrl.hostname
          
          if (hostname !== baseUrlObj.hostname && hostname !== `www.${baseUrlObj.hostname}` && baseUrlObj.hostname !== `www.${hostname}`) {
            continue
          }
          
          if (pathname.includes('datenschutz') || pathname.includes('privacy') || pathname.includes('dsgvo')) {
            hasPrivacyLink = true
            break
          }
        } catch {
          continue
        }
      }
      
      // Prüfe auch Seiteninhalt
      if (!hasPrivacyLink) {
        const content = (page.content || '').toLowerCase()
        const title = (page.title || '').toLowerCase()
        const url = (page.url || '').toLowerCase()
        
        const hasKeyword = PRIVACY_KEYWORDS.some(keyword => 
          content.includes(keyword) || title.includes(keyword) || url.includes(keyword)
        )
        
        if (hasKeyword) {
          hasPrivacyLink = true
        }
      }
    })
    
    if (!hasPrivacyLink) {
      pagesWithoutPrivacy.push(baseUrl)
    }
  } catch {
    // Bei Fehlern keine Prüfung
  }
  
  if (pagesWithoutPrivacy.length > 0) {
    results.push({
      id: 'legal-missing-privacy',
      category: 'legal',
      title: 'Datenschutzerklärung nicht gefunden',
      description: 'Auf der Website wurde keine Datenschutzerklärung gefunden. Dies ist gemäß DSGVO/GDPR erforderlich, wenn personenbezogene Daten verarbeitet werden.',
      severity: 'high',
      pages: pagesWithoutPrivacy,
      evidence: 'Keine Datenschutzerklärung gefunden',
      recommendation: 'Erstellen Sie eine Datenschutzerklärung gemäß DSGVO und verlinken Sie sie im Footer Ihrer Website.',
      categoryScoreRaw: 0, // Kritisch
    })
  }
  
  return results
}

/**
 * Prüft auf Cookie-Banner bei Cookie-Scripts (GA, FB Pixel, etc.)
 */
export function checkCookieBanner(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  const pagesWithCookieScriptsWithoutBanner: string[] = []
  
  // Cookie-Script-Indikatoren
  const cookieScriptKeywords = [
    'google-analytics.com',
    'googletagmanager.com',
    'facebook.net',
    'facebook.com/tr',
    'doubleclick.net',
    '_ga',
    '_gid',
    '_fbp',
    'cookie',
    'gdpr',
    'dsgvo',
  ]
  
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  for (const page of crawlResult.pages) {
    const html = (page.html || '').toLowerCase()
    const content = (page.content || '').toLowerCase()
    
    // Prüfe ob Cookie-Scripts vorhanden sind
    const hasCookieScript = cookieScriptKeywords.some(keyword => 
      html.includes(keyword) || content.includes(keyword)
    )
    
    if (!hasCookieScript) continue
    
    // Prüfe ob Cookie-Banner vorhanden ist
    const cookieBannerKeywords = [
      'cookie-banner',
      'cookieconsent',
      'cookie notice',
      'cookie hinweis',
      'gdpr-banner',
      'dsgvo-banner',
      'cookie-consent',
      'cookie-zustimmung',
      'accept cookies',
      'cookies akzeptieren',
      'cookie-banner', // doppelt für bessere Erkennung
      'cookies akzeptieren', // doppelt für bessere Erkennung
      'cookie reject',
      'cookie accept',
    ]
    
    const hasCookieBanner = cookieBannerKeywords.some(keyword =>
      html.includes(keyword) || content.includes(keyword)
    )
    
    // Prüfe auch nach Daten-Attributen für Cookie-Banner
    const hasCookieBannerDataAttr = /data-cookie-banner=["']true["']/i.test(html) ||
                                    /data-cookie-consent=["']true["']/i.test(html) ||
                                    /data-gdpr-banner=["']true["']/i.test(html) ||
                                    /id=["']cookie-banner["']/i.test(html)
    
    // Prüfe ob ein div/button mit cookie/cookie-banner class vorhanden ist
    const hasCookieBannerElement = /<div[^>]*class=["'][^"']*(?:cookie|consent|banner)[^"']*["']/i.test(html) ||
                                   /<button[^>]*class=["'][^"']*(?:cookie|consent|accept|reject)[^"']*["']/i.test(html)
    
    // Prüfe auch nach noscript-Tag mit Cookie-Banner-Text (für Scanner-Erkennung)
    const hasCookieBannerNoscript = /<noscript[^>]*>[\s\S]*?cookie[^<]*banner[\s\S]*?<\/noscript>/i.test(html)
    
    if (!hasCookieBanner && !hasCookieBannerElement && !hasCookieBannerDataAttr && !hasCookieBannerNoscript) {
      pagesWithCookieScriptsWithoutBanner.push(page.url)
    }
  }
  
  if (pagesWithCookieScriptsWithoutBanner.length > 0) {
    const severity = pagesWithCookieScriptsWithoutBanner.length > 2 ? 'high' : 'medium'
    results.push({
      id: 'legal-missing-cookie-banner',
      category: 'legal',
      title: `${pagesWithCookieScriptsWithoutBanner.length} Seite(n) mit Cookie-Scripts ohne Cookie-Banner`,
      description: `Diese Seiten verwenden Cookie-Scripts (z.B. Google Analytics, Facebook Pixel), haben aber kein Cookie-Banner. Dies ist gemäß DSGVO/GDPR erforderlich.`,
      severity,
      pages: pagesWithCookieScriptsWithoutBanner.slice(0, 5),
      evidence: `Cookie-Scripts erkannt, aber kein Cookie-Banner gefunden`,
      recommendation: 'Implementieren Sie ein Cookie-Banner gemäß DSGVO/GDPR, das Nutzer über Cookies informiert und Zustimmung einholt.',
      categoryScoreRaw: severity === 'high' ? Math.max(0, 100 - (pagesWithCookieScriptsWithoutBanner.length * 15)) : Math.max(0, 100 - (pagesWithCookieScriptsWithoutBanner.length * 8)),
    })
  }
  
  return results
}

/**
 * Prüft auf externe Fonts/CDNs ohne Hinweis (nur Warnung, low severity)
 */
export function checkExternalFonts(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  const pagesWithExternalFonts: string[] = []
  
  // Externe Font/CDN-Indikatoren
  const externalFontKeywords = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net',
    'unpkg.com',
    'maxcdn.bootstrapcdn.com',
    'ajax.googleapis.com',
  ]
  
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    const assets = page.assets || {}
    
    // Prüfe ob externe Fonts/CDNs verwendet werden
    let hasExternalFonts = false
    
    // Prüfe HTML nach externen Font-Links
    for (const keyword of externalFontKeywords) {
      if (html.includes(keyword)) {
        hasExternalFonts = true
        break
      }
    }
    
    // Prüfe Assets nach externen Fonts
    if (!hasExternalFonts && assets && 'fonts' in assets && Array.isArray(assets.fonts)) {
      for (const fontUrl of assets.fonts) {
        if (typeof fontUrl === 'string' && externalFontKeywords.some(keyword => fontUrl.includes(keyword))) {
          hasExternalFonts = true
          break
        }
      }
    }
    
    if (hasExternalFonts) {
      pagesWithExternalFonts.push(page.url)
    }
  }
  
  if (pagesWithExternalFonts.length > 0) {
    results.push({
      id: 'legal-external-fonts-warning',
      category: 'legal',
      title: `${pagesWithExternalFonts.length} Seite(n) verwendet externe Fonts/CDNs`,
      description: `Diese Seiten laden Fonts oder andere Ressourcen von externen CDNs (z.B. Google Fonts). Dies kann Datenschutzbedenken aufwerfen, da Nutzerdaten an Drittanbieter übertragen werden.`,
      severity: 'low',
      pages: pagesWithExternalFonts.slice(0, 5),
      evidence: `Externe Fonts/CDNs erkannt`,
      recommendation: 'Erwägen Sie, Fonts lokal zu hosten oder einen DSGVO-konformen Font-Service zu verwenden. Aktualisieren Sie ggf. Ihre Datenschutzerklärung.',
      categoryScoreRaw: 95, // Nur leichter Hinweis
    })
  }
  
  return results
}

/**
 * Führt alle Legal Checks aus
 */
export function runLegalChecks(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  
  results.push(...checkImpressum(crawlResult))
  results.push(...checkPrivacyPolicy(crawlResult))
  
  // Neue Checks
  results.push(...checkCookieBanner(crawlResult))
  results.push(...checkExternalFonts(crawlResult))
  
  return results
}

