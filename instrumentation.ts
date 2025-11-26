export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Worker is disabled - puppeteer removed for serverless compatibility
    // In production, scans are handled by external scanner service via SCANNER_API_URL
    
    if (process.env.SCANNER_API_URL) {
      console.log('[Instrumentation] SCANNER_API_URL configured - using external scanner service')
    } else {
      console.warn('[Instrumentation] SCANNER_API_URL not set - scanner service required')
    }
  }
}

