export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Worker is disabled in Vercel (puppeteer removed for serverless compatibility)
    // Worker is only needed for local development with puppeteer
    // In production, scans are handled by external scanner service via SCANNER_API_URL
    
    // Check if SCANNER_API_URL is set - if so, worker is not needed
    if (process.env.SCANNER_API_URL) {
      console.log('[Instrumentation] SCANNER_API_URL configured - worker disabled (using external scanner service)')
      return
    }
    
    // Try to start worker for local development (only if puppeteer is available)
    try {
      const { startWorker } = await import('./worker/worker')
      
      // Start worker in background (don't await)
      startWorker().catch((error) => {
        console.error('Failed to start worker:', error)
      })
      
      console.log('[Instrumentation] Worker started (local development mode)')
    } catch (error) {
      console.warn('[Instrumentation] Worker not available (puppeteer not installed). This is expected in Vercel deployment.')
      console.warn('[Instrumentation] Set SCANNER_API_URL to use external scanner service.')
    }
  }
}

