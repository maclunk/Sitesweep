/**
 * Test-Runner für den Website-Scanner
 * 
 * Testet 3 feste URLs und loggt rawPageData + Issues
 * 
 * Usage: npx tsx scripts/test-scanner.ts
 */

import { crawl } from '../lib/crawler'
import { runChecks } from '../lib/checks'
import { normalizeUrl } from '../lib/utils'

// Test-URLs (ersetze mit deinen Testseiten)
const TEST_URLS = [
  'https://example.com',
  'https://www.google.com',
  'https://www.github.com',
]

async function testScanner() {
  console.log('🧪 Website-Scanner Test-Runner\n')
  console.log('=' .repeat(60))

  for (const url of TEST_URLS) {
    console.log(`\n📋 Teste: ${url}`)
    console.log('-'.repeat(60))

    try {
      // 1. URL normalisieren
      const normalizedUrl = normalizeUrl(url)
      console.log(`✅ Normalisierte URL: ${normalizedUrl}`)

      // 2. Crawl durchführen
      console.log(`\n🔍 Starte Crawl...`)
      const crawlStart = Date.now()
      const crawlResult = await crawl(url)
      const crawlTime = Date.now() - crawlStart
      
      console.log(`✅ Crawl abgeschlossen (${crawlTime}ms)`)
      console.log(`📄 Seiten gefunden: ${crawlResult.pages.length}`)
      
      if (crawlResult.robotsTxt) {
        console.log(`🤖 Robots.txt: ${crawlResult.robotsTxt.exists ? 'gefunden' : 'nicht gefunden'}`)
        if (crawlResult.robotsTxt.disallowedPaths.length > 0) {
          console.log(`   Disallowed Paths: ${crawlResult.robotsTxt.disallowedPaths.slice(0, 3).join(', ')}`)
        }
      }

      if (crawlResult.crawlMetadata) {
        console.log(`📊 Crawl-Metadaten:`)
        console.log(`   - Total Pages: ${crawlResult.crawlMetadata.totalPages}`)
        console.log(`   - Total Size: ${(crawlResult.crawlMetadata.totalSize / 1024).toFixed(2)} KB`)
        console.log(`   - Crawl Time: ${crawlResult.crawlMetadata.crawlTime}ms`)
      }

      // 3. Raw Page Data anzeigen
      console.log(`\n📄 Raw Page Data (Erste Seite):`)
      const firstPage = crawlResult.pages[0]
      if (firstPage) {
        console.log(`   URL: ${firstPage.url}`)
        if (firstPage.finalUrl && firstPage.finalUrl !== firstPage.url) {
          console.log(`   Final URL: ${firstPage.finalUrl}`)
        }
        console.log(`   Status: ${firstPage.status}`)
        console.log(`   Title: ${firstPage.title || '(leer)'}`)
        console.log(`   Meta Description: ${firstPage.metaDescription || '(nicht vorhanden)'}`)
        console.log(`   H1 Count: ${firstPage.h1Count || 0}`)
        console.log(`   H2 Count: ${firstPage.h2Count || 0}`)
        console.log(`   Links (Total): ${firstPage.links?.length || 0}`)
        console.log(`   Internal Links: ${firstPage.internalLinks?.length || 0}`)
        console.log(`   External Links: ${firstPage.externalLinks?.length || 0}`)
        console.log(`   Images: ${firstPage.images?.length || 0}`)
        console.log(`   Assets - CSS: ${firstPage.assets?.css?.length || 0}`)
        console.log(`   Assets - JS: ${firstPage.assets?.js?.length || 0}`)
        console.log(`   Script Count: ${firstPage.scriptCount || 0}`)
        console.log(`   Word Count: ${firstPage.wordCount || 0}`)
        console.log(`   Is SPA: ${firstPage.isSPA ? 'Ja' : 'Nein'}`)
        if (firstPage.timings) {
          console.log(`   Timings - TTFB: ${firstPage.timings.ttfb || 'N/A'}ms`)
          console.log(`   Timings - Total: ${firstPage.timings.total || 'N/A'}ms`)
        }
        if (firstPage.errors && firstPage.errors.length > 0) {
          console.log(`   Errors: ${firstPage.errors.slice(0, 3).join(', ')}`)
        }
        if (firstPage.loadErrors && firstPage.loadErrors.length > 0) {
          console.log(`   Load Errors: ${firstPage.loadErrors.slice(0, 3).join(', ')}`)
        }
        if (firstPage.redirectChain && firstPage.redirectChain.length > 0) {
          console.log(`   Redirect Chain: ${firstPage.redirectChain.join(' → ')}`)
        }
      }

      // 4. Checks ausführen
      console.log(`\n🔍 Starte Checks...`)
      const checksStart = Date.now()
      const checkResults = await runChecks(crawlResult)
      const checksTime = Date.now() - checksStart
      
      console.log(`✅ Checks abgeschlossen (${checksTime}ms)`)
      console.log(`📊 Issues gefunden: ${checkResults.length}`)

      // 5. Issues gruppiert nach Kategorie anzeigen
      const issuesByCategory = {
        technical: checkResults.filter(c => c.category === 'technical'),
        seo: checkResults.filter(c => c.category === 'seo'),
        legal: checkResults.filter(c => c.category === 'legal'),
        ux: checkResults.filter(c => c.category === 'ux'),
      }

      Object.entries(issuesByCategory).forEach(([category, issues]) => {
        if (issues.length > 0) {
          console.log(`\n   ${category.toUpperCase()}: ${issues.length} Issue(s)`)
          issues.slice(0, 3).forEach(issue => {
            console.log(`      - [${issue.severity.toUpperCase()}] ${issue.title}`)
            // Note: CheckResult interface doesn't include evidence property
          })
        }
      })

    } catch (error) {
      console.error(`❌ Fehler beim Testen von ${url}:`)
      if (error instanceof Error) {
        console.error(`   ${error.message}`)
        if (error.stack) {
          console.error(`   ${error.stack.split('\n').slice(0, 3).join('\n   ')}`)
        }
      } else {
        console.error(`   ${String(error)}`)
      }
    }

    console.log('\n' + '='.repeat(60))
  }

  console.log('\n✅ Alle Tests abgeschlossen!\n')
}

// Run tests
testScanner().catch((error) => {
  console.error('❌ Fataler Fehler:', error)
  process.exit(1)
})

