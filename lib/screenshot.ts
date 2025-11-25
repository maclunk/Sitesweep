import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Optional puppeteer import (for local development only)
let puppeteer: any
try {
  puppeteer = require('puppeteer')
} catch {
  // Puppeteer not available (expected in Vercel deployment)
}

type Browser = any
type Page = any

/**
 * Erstellt einen mobilen Screenshot der Startseite
 * @param url Die URL der zu screenshotenden Seite
 * @param outputPath Der vollständige Pfad, wo der Screenshot gespeichert werden soll
 * @returns Der relative Pfad zum Screenshot (z.B. "/screenshots/abc123.png")
 */
export async function createMobileScreenshot(
  url: string,
  outputPath: string
): Promise<string> {
  let browser: Browser | null = null

  // Gesamt-Timeout von 20 Sekunden für die gesamte Screenshot-Erstellung
  const SCREENSHOT_TIMEOUT = 20000
  let timeoutId: NodeJS.Timeout | null = null

  const cleanup = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    if (browser) {
      try {
        await browser.close()
        browser = null
      } catch (closeError) {
        // Ignore close errors
        console.debug('Error closing browser:', closeError)
      }
    }
  }

  // Check if puppeteer is available
  if (!puppeteer) {
    throw new Error('Screenshot generation is not available. Puppeteer has been removed for Vercel compatibility.')
  }

  try {
    // Wrapp die gesamte Screenshot-Erstellung in einen Timeout
    const screenshotPromise = (async (): Promise<string> => {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
        timeout: 30000, // Reduziert auf 30 Sekunden für Browser-Start
      })

      const page = await browser.newPage()

      // iPhone 12 Viewport (390x844)
      await page.setViewport({
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
      })

      // Set User-Agent für mobile Ansicht
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      )

      // Reduziertes Timeout für schnelleres Laden
      page.setDefaultNavigationTimeout(10000) // 10 Sekunden statt 15

      // Navigate zur Seite - verwende 'load' statt 'networkidle2' für schnellere Ergebnisse
      // 'load' wartet bis DOM und Ressourcen geladen sind, aber nicht bis Netzwerk komplett idle
      await page.goto(url, {
        waitUntil: 'load', // Schneller als 'networkidle2'
        timeout: 10000,
      })

      // Reduzierte Wartezeit
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 Sekunde statt 2

      // Screenshot erstellen
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false, // Nur viewport, nicht die ganze Seite
      })

      await page.close()

      // Stelle sicher, dass das Verzeichnis existiert
      const dir = join(process.cwd(), 'public', 'screenshots')
      await mkdir(dir, { recursive: true })

      // Speichere Screenshot
      await writeFile(outputPath, screenshot)

      // Berechne relativen Pfad (z.B. "/screenshots/abc123.png")
      const relativePath = outputPath.replace(join(process.cwd(), 'public'), '').replace(/\\/g, '/')

      return relativePath
    })()

    // Race condition: Screenshot erstellen oder Timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Screenshot timeout after 20 seconds'))
      }, SCREENSHOT_TIMEOUT)
    })

    const result = await Promise.race([screenshotPromise, timeoutPromise])
    
    // Cleanup bei Erfolg
    await cleanup()
    
    return result
  } catch (error) {
    // Cleanup bei Fehler
    await cleanup()
    console.error('Error creating mobile screenshot:', error)
    throw error
  }
}

