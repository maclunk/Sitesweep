import { db } from '../lib/db'
import { crawl } from '../lib/crawler'
import { runChecks, CheckResult } from '../lib/checks'
import { buildReport } from '../lib/report'
import { sleep } from '../lib/utils'
import { createMobileScreenshot } from '../lib/screenshot'
import { join } from 'path'
import { SAFE_MODE } from '../lib/config'
import { updateBenchmarkAggregate } from '../lib/benchmark'

export async function startWorker(): Promise<void> {
  console.log('Worker started')

  while (true) {
    try {
      // 1. ScanJob mit status="pending" holen
      const scanJob = await db.scanJob.findFirst({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
      })

      if (!scanJob) {
        // Keine Jobs vorhanden, 3 Sekunden warten
        await sleep(3000)
        continue
      }

      if (SAFE_MODE) {
        console.log(`[Worker] SAFE_MODE active – starting job ${scanJob.id} for ${scanJob.url}`)
      } else {
        console.log(`[Worker] Starting job ${scanJob.id} for ${scanJob.url}`)
      }

      try {
        // 2. status="running" setzen
        await db.scanJob.update({
          where: { id: scanJob.id },
          data: { status: 'running' },
        })

        // 3. crawl(url) with timeout
        // Performance: Reduziertes Timeout für schnellere Fehlerbehandlung
        let crawlResult
        try {
          crawlResult = await Promise.race([
            crawl(scanJob.url),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Crawl timeout after 3 minutes')), 3 * 60 * 1000)
            ),
          ])
        } catch (crawlError) {
          throw new Error(`Crawl failed: ${crawlError instanceof Error ? crawlError.message : String(crawlError)}`)
        }

        if (!crawlResult || !crawlResult.pages || !Array.isArray(crawlResult.pages)) {
          throw new Error('Invalid crawl result: no pages found')
        }

        console.log(`Crawled ${crawlResult.pages.length} pages`)

        // 4. checks = runChecks(crawl)
        let checks: CheckResult[] = []
        try {
          const checkResults = await runChecks(crawlResult)
          if (Array.isArray(checkResults)) {
            checks = checkResults
          }
        } catch (checkError) {
          console.error(`Error running checks for job ${scanJob.id}:`, checkError)
          checks = [] // Continue with empty checks
        }
        console.log(`Found ${checks.length} issues`)

        // 5. report = buildReport(crawl, checks)
        const report = buildReport(crawlResult, checks)
        if (typeof report.score !== 'number' || report.score < 0 || report.score > 100) {
          throw new Error(`Invalid report score: ${report.score}`)
        }
        console.log(`Report score: ${report.score}`)

        // 5.5. Mobile Screenshot erstellen (nur wenn nicht SAFE_MODE)
        let screenshotUrl: string | null = null
        if (!SAFE_MODE) {
          try {
            const screenshotFilename = `${scanJob.id}.png`
            const screenshotPath = join(process.cwd(), 'public', 'screenshots', screenshotFilename)
            
            // Screenshot mit Timeout-Wrapper (max. 25 Sekunden)
            screenshotUrl = await Promise.race([
              createMobileScreenshot(scanJob.url, screenshotPath),
              new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('Screenshot timeout')), 25000)
              ),
            ]).catch(() => null) // Bei Fehler: null statt Exception
            
            if (screenshotUrl) {
              console.log(`Mobile screenshot created: ${screenshotUrl}`)
            } else {
              console.log(`Mobile screenshot skipped due to timeout/error for job ${scanJob.id}`)
            }
          } catch (screenshotError) {
            console.error(`Error creating mobile screenshot for job ${scanJob.id}:`, screenshotError)
            // Screenshot-Fehler nicht kritisch, Scan kann trotzdem fortgesetzt werden
            screenshotUrl = null
          }
        }

        // 6. ScanResult speichern
        const scanResult = await db.scanResult.create({
          data: {
            scanJobId: scanJob.id,
            score: report.score,
            scoreRaw: report.scoreRaw || null, // Optional: Roh-Score vor Normalisierung
            summary: report.summary || '',
            issues: Array.isArray(report.issues) ? (report.issues as any) : [],
            scoreBreakdown: report.scoreBreakdown ? (report.scoreBreakdown as any) : null,
            mobileScreenshotUrl: screenshotUrl,
          },
        })

        // 7. ScanJob auf status="done" setzen
        const updatedJob = await db.scanJob.update({
          where: { id: scanJob.id },
          data: {
            status: 'done',
            finishedAt: new Date(),
          },
          include: {
            result: true,
          },
        })

        // 7.5. Update benchmark aggregate if industry + city are available
        if (updatedJob.industry && updatedJob.city && updatedJob.result) {
          // Run benchmark update asynchronously (don't block scan completion)
          updateBenchmarkAggregate(
            updatedJob.industry,
            updatedJob.city,
            updatedJob.result.score
          ).catch((benchmarkError) => {
            // Log but don't fail - benchmark update is non-critical
            console.error(
              `[Worker] Failed to update benchmark for job ${scanJob.id}:`,
              benchmarkError
            )
          })
        }

        if (SAFE_MODE) {
          console.log(`[Worker] SAFE_MODE – finished job ${scanJob.id} with status: done`)
        } else {
          console.log(`[Worker] Finished job ${scanJob.id} with status: done`)
        }
      } catch (error) {
        // 8. Fehler abfangen → status="error"
        const errorMessage = error instanceof Error ? error.message : String(error)
        const truncatedError = errorMessage.length > 500 ? errorMessage.substring(0, 500) + '...' : errorMessage
        
        console.error(`[Worker] Finished job ${scanJob.id} with status: error - ${errorMessage}`)

        try {
          await db.scanJob.update({
            where: { id: scanJob.id },
            data: {
              status: 'error',
              error: truncatedError,
              finishedAt: new Date(),
            },
          })
        } catch (updateError) {
          console.error(`Failed to update error status for job ${scanJob.id}:`, updateError)
        }
      }
    } catch (error) {
      // Performance: Worker-Schleife darf nicht crashen - bei Fehlern weiterarbeiten
      console.error('[Worker] Critical error in worker loop:', error)
      // Bei kritischen Fehlern kurz warten, bevor es weitergeht
      await sleep(2000)
    }
  }
}

// Start worker if this file is run directly
if (require.main === module) {
  startWorker().catch((error) => {
    console.error('Fatal worker error:', error)
    process.exit(1)
  })
}

