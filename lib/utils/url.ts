/**
 * URL-Utilities für robuste URL-Normalisierung und -Verarbeitung
 */

/**
 * Tracking-Parameter, die aus URLs entfernt werden sollen
 */
const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'ref',
  'source',
  'campaign_id',
  'mc_cid',
  'mc_eid',
  '_hsenc',
  'hsCtaTracking',
  'mkt_tok',
  'ICID',
  'cid',
  'ncid',
  'ncampaignid',
  'WT.mc_id',
  'WT.mc_ev',
]

/**
 * Normalisiert eine URL:
 * - Entfernt trailing slashes (außer root)
 * - Entfernt default ports (80, 443)
 * - Entfernt Hash
 * - Normalisiert Query-Parameter
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // Remove trailing slash from pathname (except for root)
    if (urlObj.pathname.length > 1 && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1)
    }
    
    // Remove default ports
    if (urlObj.port === '80' && urlObj.protocol === 'http:') {
      urlObj.port = ''
    }
    if (urlObj.port === '443' && urlObj.protocol === 'https:') {
      urlObj.port = ''
    }
    
    // Remove hash
    urlObj.hash = ''
    
    // Normalize query parameters (sort)
    if (urlObj.search) {
      const params = new URLSearchParams(urlObj.search)
      const sortedParams = new URLSearchParams()
      Array.from(params.keys())
        .sort()
        .forEach((key) => {
          sortedParams.append(key, params.get(key) || '')
        })
      urlObj.search = sortedParams.toString()
    }
    
    return urlObj.href
  } catch {
    return url
  }
}

/**
 * Entfernt Tracking-Parameter aus einer URL
 */
export function removeTrackingParams(url: string): string {
  try {
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search)
    
    let changed = false
    TRACKING_PARAMS.forEach((param) => {
      if (params.has(param)) {
        params.delete(param)
        changed = true
      }
    })
    
    if (changed) {
      urlObj.search = params.toString()
      return urlObj.href
    }
    
    return url
  } catch {
    return url
  }
}

/**
 * Löst eine relative URL gegen eine Base-URL auf
 */
export function resolveRelativeUrl(relative: string, base: string): string | null {
  try {
    return new URL(relative, base).href
  } catch {
    return null
  }
}

/**
 * Normalisiert URL für Vergleich (ohne Query und Hash)
 */
export function normalizeForComparison(url: string): string {
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
 * Prüft, ob zwei URLs zur gleichen Domain gehören
 */
export function sameDomain(url1: string, url2: string): boolean {
  try {
    const url1Obj = new URL(url1)
    const url2Obj = new URL(url2)
    return url1Obj.hostname === url2Obj.hostname
  } catch {
    return false
  }
}

/**
 * Extrahiert die Base-Domain (ohne Subdomain)
 * z.B. www.example.com -> example.com
 */
export function getBaseDomain(url: string): string | null {
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
 * Prüft, ob zwei URLs zur gleichen Base-Domain gehören (ohne Subdomain)
 */
export function sameBaseDomain(url1: string, url2: string): boolean {
  const base1 = getBaseDomain(url1)
  const base2 = getBaseDomain(url2)
  return base1 !== null && base2 !== null && base1 === base2
}

/**
 * Validiert eine URL
 */
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Prüft Content-Type einer URL (für Asset-Filterung)
 */
export function getContentTypeFromExtension(url: string): 'html' | 'image' | 'pdf' | 'css' | 'js' | 'font' | 'other' {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    
    if (pathname.endsWith('.html') || pathname.endsWith('.htm') || pathname === '/' || !pathname.match(/\./)) {
      return 'html'
    }
    if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)$/)) {
      return 'image'
    }
    if (pathname.match(/\.pdf$/)) {
      return 'pdf'
    }
    if (pathname.match(/\.css$/)) {
      return 'css'
    }
    if (pathname.match(/\.(js|mjs)$/)) {
      return 'js'
    }
    if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
      return 'font'
    }
    
    return 'other'
  } catch {
    return 'other'
  }
}

