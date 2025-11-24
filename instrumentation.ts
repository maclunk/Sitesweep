export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Start worker only in Node.js runtime (not in Edge runtime)
    const { startWorker } = await import('./worker/worker')
    
    // Start worker in background (don't await)
    startWorker().catch((error) => {
      console.error('Failed to start worker:', error)
    })
    
    console.log('[Instrumentation] Worker started')
  }
}

