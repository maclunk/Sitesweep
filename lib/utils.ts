export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // Ensure the URL has a valid protocol (http or https)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Tracking-Parameter, die entfernt werden sollen
const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'ref', 'source', 'campaign',
  '_ga', '_gid', 'mc_cid', 'mc_eid',
  'igshid', 'igsh', 'twclid', 'yclid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'ref', 'source', 'campaign'
]

/**
 * Entfernt Tracking-Parameter aus einer URL
 */
export function removeTrackingParams(url: string): string {
  try {
    const urlObj = new URL(url)
    const params = urlObj.searchParams
    
    // Entferne alle Tracking-Parameter
    TRACKING_PARAMS.forEach(param => {
      if (params.has(param)) {
        params.delete(param)
      }
    })
    
    urlObj.search = params.toString()
    return urlObj.href
  } catch {
    return url
  }
}

/**
 * Normalisiert eine URL (ohne Tracking-Parameter)
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // Remove tracking parameters
    TRACKING_PARAMS.forEach(param => {
      urlObj.searchParams.delete(param)
    })
    
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
    
    return urlObj.href
  } catch {
    return url
  }
}

/**
 * Löst eine relative URL gegen eine Basis-URL auf
 */
export function resolveRelativeUrl(relativeUrl: string, baseUrl: string): string {
  try {
    const base = new URL(baseUrl)
    const resolved = new URL(relativeUrl, base)
    return resolved.href
  } catch {
    return relativeUrl
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function sameDomain(link: string, base: string): boolean {
  try {
    const linkUrl = new URL(link)
    const baseUrl = new URL(base)
    return linkUrl.hostname === baseUrl.hostname
  } catch {
    return false
  }
}

