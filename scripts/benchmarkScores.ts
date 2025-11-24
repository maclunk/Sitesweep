/**
 * Benchmark-Script für Score-Verteilung
 * 
 * Scannt 10 Test-URLs und loggt raw + final Scores + Issue-Counts
 * Ziel: Score-Verteilung analysieren und Feinjustierung ermöglichen
 */

import { crawl } from '../lib/crawler'
import { runChecks } from '../lib/checks'
import { buildReport } from '../lib/report'

const TEST_URLS = [
  'https://www.example.com',
  'https://www.google.com',
  'https://www.github.com',
  'https://www.wikipedia.org',
  'https://www.stackoverflow.com',
  'https://www.reddit.com',
  'https://www.youtube.com',
  'https://www.amazon.de',
  'https://www.spiegel.de',
  'https://www.heise.de',
]

interface BenchmarkResult {
  url: string
  rawScore: number | null
  finalScore: number | null
  issueCount: number
  highSeverityCount: number
  mediumSeverityCount: number
  lowSeverityCount: number
  breakdown: {
    technical: number
    seo: number
    legal: number
    uxDesign: number
    rawOverall: number
  } | null
  error?: string
}

async function benchmarkScore(url: string): Promise<BenchmarkResult> {
  console.log(`\n[Benchmark] Scanning: ${url}`)
  
  try {
    // 1. Crawl
    const crawlResult = await crawl(url)
    console.log(`  ✓ Crawled ${crawlResult.pages.length} pages`)
    
    // 2. Run Checks
    const checkResults = await runChecks(crawlResult)
    console.log(`  ✓ Found ${checkResults.length} issues`)
    
    // 3. Build Report
    const report = buildReport(crawlResult, checkResults)
    
    // 4. Count Issues by Severity
    const highSeverityCount = checkResults.filter(i => i.severity === 'high').length
    const mediumSeverityCount = checkResults.filter(i => i.severity === 'medium').length
    const lowSeverityCount = checkResults.filter(i => i.severity === 'low').length
    
    // 5. Extract Breakdown
    const breakdown = report.scoreBreakdown ? {
      technical: (report.scoreBreakdown as any).technical || 0,
      seo: (report.scoreBreakdown as any).seo || 0,
      legal: (report.scoreBreakdown as any).legal || 0,
      uxDesign: (report.scoreBreakdown as any).uxDesign || 0,
      rawOverall: (report.scoreBreakdown as any).rawOverall || 0,
    } : null
    
    return {
      url,
      rawScore: report.scoreRaw || null,
      finalScore: report.score || null,
      issueCount: checkResults.length,
      highSeverityCount,
      mediumSeverityCount,
      lowSeverityCount,
      breakdown,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`  ✗ Error: ${errorMessage}`)
    return {
      url,
      rawScore: null,
      finalScore: null,
      issueCount: 0,
      highSeverityCount: 0,
      mediumSeverityCount: 0,
      lowSeverityCount: 0,
      breakdown: null,
      error: errorMessage,
    }
  }
}

async function runBenchmark() {
  console.log('='.repeat(80))
  console.log('SiteSweep Score Benchmark')
  console.log('='.repeat(80))
  console.log(`Testing ${TEST_URLS.length} URLs...`)
  
  const results: BenchmarkResult[] = []
  
  for (const url of TEST_URLS) {
    const result = await benchmarkScore(url)
    results.push(result)
    
    // Kurze Pause zwischen Scans
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Zusammenfassung
  console.log('\n' + '='.repeat(80))
  console.log('BENCHMARK RESULTS')
  console.log('='.repeat(80))
  
  const successfulResults = results.filter(r => !r.error)
  const failedResults = results.filter(r => r.error)
  
  if (successfulResults.length > 0) {
    console.log('\n📊 Score-Verteilung (erfolgreiche Scans):')
    console.log('-'.repeat(80))
    
    // Header
    console.log(
      'URL'.padEnd(30) +
      'Raw'.padEnd(8) +
      'Final'.padEnd(8) +
      'Issues'.padEnd(8) +
      'H/M/L'.padEnd(10) +
      'Breakdown (T/S/L/U)'
    )
    console.log('-'.repeat(80))
    
    // Results
    for (const result of successfulResults) {
      const urlShort = result.url.length > 28 ? result.url.substring(0, 25) + '...' : result.url
      const rawStr = result.rawScore !== null ? String(result.rawScore).padEnd(8) : 'N/A'.padEnd(8)
      const finalStr = result.finalScore !== null ? String(result.finalScore).padEnd(8) : 'N/A'.padEnd(8)
      const issuesStr = String(result.issueCount).padEnd(8)
      const severityStr = `${result.highSeverityCount}/${result.mediumSeverityCount}/${result.lowSeverityCount}`.padEnd(10)
      
      let breakdownStr = 'N/A'
      if (result.breakdown) {
        breakdownStr = `${result.breakdown.technical}/${result.breakdown.seo}/${result.breakdown.legal}/${result.breakdown.uxDesign}`
      }
      
      console.log(
        urlShort.padEnd(30) +
        rawStr +
        finalStr +
        issuesStr +
        severityStr +
        breakdownStr
      )
    }
    
    // Statistiken
    console.log('\n📈 Statistiken:')
    console.log('-'.repeat(80))
    
    const rawScores = successfulResults.map(r => r.rawScore).filter((s): s is number => s !== null)
    const finalScores = successfulResults.map(r => r.finalScore).filter((s): s is number => s !== null)
    
    if (rawScores.length > 0) {
      const rawAvg = rawScores.reduce((a, b) => a + b, 0) / rawScores.length
      const rawMin = Math.min(...rawScores)
      const rawMax = Math.max(...rawScores)
      console.log(`Raw Score:   Durchschnitt: ${rawAvg.toFixed(1)}, Min: ${rawMin}, Max: ${rawMax}`)
    }
    
    if (finalScores.length > 0) {
      const finalAvg = finalScores.reduce((a, b) => a + b, 0) / finalScores.length
      const finalMin = Math.min(...finalScores)
      const finalMax = Math.max(...finalScores)
      console.log(`Final Score: Durchschnitt: ${finalAvg.toFixed(1)}, Min: ${finalMin}, Max: ${finalMax}`)
    }
    
    // Score-Verteilung
    const lowRange = finalScores.filter(s => s < 50).length
    const midRange = finalScores.filter(s => s >= 50 && s < 80).length
    const highRange = finalScores.filter(s => s >= 80).length
    
    console.log(`\nScore-Verteilung (Final):`)
    console.log(`  < 50 (mittelmäßig):  ${lowRange} URLs`)
    console.log(`  50-80 (gut):         ${midRange} URLs`)
    console.log(`  ≥ 80 (sehr gut):     ${highRange} URLs`)
  }
  
  if (failedResults.length > 0) {
    console.log('\n❌ Fehlgeschlagene Scans:')
    console.log('-'.repeat(80))
    for (const result of failedResults) {
      console.log(`  ${result.url}: ${result.error}`)
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log(`Benchmark abgeschlossen: ${successfulResults.length}/${results.length} erfolgreich`)
  console.log('='.repeat(80))
}

// Main
if (require.main === module) {
  runBenchmark()
    .then(() => {
      console.log('\nBenchmark beendet.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nFatal error:', error)
      process.exit(1)
    })
}

export { runBenchmark, benchmarkScore }

